import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionButtons from '../src/components/game/ActionButtons';
import CardReveal from '../src/components/game/CardReveal';
import CountdownTimer from '../src/components/game/CountdownTimer';
import AnimatedCard, { AnimatedCardRef } from '../src/components/ui/AnimatedCard';
import GradientBackground from '../src/components/ui/GradientBackground';
import ParticleBackground from '../src/components/ui/ParticleBackground';
import { Colors } from '../src/constants/colors';
import { tr } from '../src/i18n';
import { Sounds } from '../src/utils/sounds';
import { useGameStore } from '../src/store/gameStore';

// Truth or Dare selection card
function TODCard({ type, label, emoji, onPress }: { type: 'truth' | 'dare'; label: string; emoji: string; onPress: () => void }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const pulse   = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 1100, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 1100, useNativeDriver: true }),
    ])).start();
    if (type === 'dare') {
      Animated.loop(Animated.sequence([
        Animated.timing(shimmer, { toValue: 300, duration: 2200, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(shimmer, { toValue: -200, duration: 0, useNativeDriver: true }),
      ])).start();
    }
  }, []);

  const handlePress = () => {
    type === 'dare' ? Sounds.playDare() : Sounds.playClick();
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80,  useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 160, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const isTruth  = type === 'truth';
  const accent   = isTruth ? Colors.brand.neonBlue : Colors.brand.fire;
  const bgColor  = isTruth ? 'rgba(61,214,245,0.08)' : 'rgba(255,69,0,0.12)';

  return (
    <Animated.View style={[tod.wrap, { transform: [{ scale: Animated.multiply(scale, pulse) }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}
        style={[tod.card, { backgroundColor: bgColor, borderColor: accent }]}
      >
        <View style={[tod.strip, { backgroundColor: accent }]} />
        {!isTruth && (
          <Animated.View style={[tod.shimmer, { transform: [{ translateX: shimmer }, { skewX: '-15deg' }] }]} />
        )}
        <Text style={tod.emoji}>{emoji}</Text>
        <Text style={[tod.label, { color: accent, fontFamily: 'BebasNeue_400Regular' }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function GameScreen() {
  const {
    gameState, selectCardType, onRevealComplete, onTimerComplete,
    completeTurn, skipTurn, endGame, language,
  } = useGameStore();
  const t = (k: string) => tr(language, k);
  const cardRef = useRef<AnimatedCardRef>(null);
  const gs = gameState;

  useEffect(() => {
    if (!gs) { router.replace('/'); return; }
    if (gs.phase === 'game_over') router.replace('/results');
    if (gs.phase === 'forfeit')   router.push('/forfeit');
    if (gs.phase === 'choosing')  cardRef.current?.reset();
  }, [gs?.phase]);

  if (!gs) return null;

  const currentPlayer = gs.config.players[gs.currentPlayerIndex];
  const partnerIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
  const partnerGender = gs.config.players[partnerIndex].gender;

  const currentRound = Math.ceil(gs.turnNumber / 2);
  const roundDisplay = gs.config.totalRounds === null
    ? '∞'
    : `${Math.min(currentRound, gs.config.totalRounds)} / ${gs.config.totalRounds}`;

  const handleTypeSelect = (type: 'truth' | 'dare') => {
    selectCardType(type);
    setTimeout(() => cardRef.current?.flip(), 50);
  };

  const isChoosing = gs.phase === 'choosing';

  return (
    <GradientBackground colors={Colors.gradient.splash}>
      <ParticleBackground />
      <SafeAreaView style={s.safe}>
        <View style={s.root}>

          {/* ── HUD ── */}
          <View style={s.hud}>
            {/* Player 1 */}
            <View style={s.hudPlayer}>
              <Text style={[s.hudName, { color: Colors.brand.neonBlue }, gs.currentPlayerIndex === 0 && s.hudNameActive]} numberOfLines={1}>
                {gs.config.players[0].name}
              </Text>
              <Text style={[s.hudScore, gs.currentPlayerIndex === 0 && { color: Colors.brand.gold }]}>
                {gs.config.players[0].score}
              </Text>
            </View>

            {/* Center: round + end */}
            <View style={s.hudCenter}>
              <Text style={s.hudRoundLabel}>{t('round').toUpperCase()}</Text>
              <Text style={s.hudRound}>{roundDisplay}</Text>
              <TouchableOpacity onPress={endGame} style={s.endBtn}>
                <Text style={s.endBtnText}>{t('endGame')}</Text>
              </TouchableOpacity>
            </View>

            {/* Player 2 */}
            <View style={[s.hudPlayer, s.hudRight]}>
              <Text style={[s.hudName, { color: Colors.brand.neonPink }, gs.currentPlayerIndex === 1 && s.hudNameActive]} numberOfLines={1}>
                {gs.config.players[1].name}
              </Text>
              <Text style={[s.hudScore, gs.currentPlayerIndex === 1 && { color: Colors.brand.gold }]}>
                {gs.config.players[1].score}
              </Text>
            </View>
          </View>

          {/* ── Turn chip ── */}
          <View style={s.chipOuter}>
            <LinearGradient
              colors={[Colors.brand.neonBlue, Colors.brand.neonPink]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.chipGradient}
            >
              <View style={s.chipInner}>
                <Text style={s.chipLabel}>{t('yourTurn')}</Text>
                <Text style={[s.chipName, { fontFamily: 'BebasNeue_400Regular' }]}>{currentPlayer.name}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* ── Spark divider ── */}
          <View style={s.sparkWrap}>
            <LinearGradient
              colors={['transparent', Colors.brand.fireHot, Colors.brand.gold, Colors.brand.fireHot, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.sparkLine}
            />
          </View>

          {/* ── Main content ── */}
          <View style={s.main}>

            {/* AnimatedCard — always mounted; hidden during choosing to allow flip ref to work */}
            <View style={{ display: isChoosing ? 'none' : 'flex', flex: isChoosing ? 0 : 1 }}>
              <AnimatedCard
                ref={cardRef}
                frontContent={gs.currentCard ? (
                  <CardReveal
                    card={gs.currentCard}
                    language={language}
                    myGender={currentPlayer.gender}
                    partnerGender={partnerGender}
                  />
                ) : null}
                onFlipComplete={onRevealComplete}
              />
            </View>

            {/* Choosing: Truth / Dare cards */}
            {isChoosing && (
              <View style={s.todWrap}>
                <View style={s.todGrid}>
                  <TODCard type="truth" label={t('truth')} emoji="💬" onPress={() => handleTypeSelect('truth')} />
                  <TODCard type="dare"  label={t('dare')}  emoji="🔥" onPress={() => handleTypeSelect('dare')}  />
                </View>
              </View>
            )}

            {/* Timer */}
            {gs.phase === 'timer_running' && (
              <View style={s.timerBlock}>
                <CountdownTimer seconds={gs.currentCard?.timerSeconds ?? 30} onComplete={onTimerComplete} />
                <TouchableOpacity style={s.skipTimer} onPress={() => { Sounds.playClick(); onTimerComplete(); }}>
                  <Text style={s.skipTimerText}>{t('skipTimer')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Done / Skip ── */}
          {gs.phase === 'awaiting_done' && (
            <ActionButtons
              onDone={() => { Sounds.playDone(); completeTurn(); }}
              onSkip={skipTurn}
              skipsRemaining={gs.skipsRemaining}
              doneLabel={t('done')}
              skipLabel={t('skip')}
              skipsLeftLabel={t('skipsLeft')}
              noSkipsLabel={t('noSkipsLeft')}
            />
          )}

        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 16, gap: 0 },

  // HUD
  hud: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  hudPlayer: { flex: 1, alignItems: 'flex-start' },
  hudRight:  { alignItems: 'flex-end' },
  hudName: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: Colors.text.muted, maxWidth: 100 },
  hudNameActive: { color: Colors.text.primary, opacity: 1 },
  hudScore: { fontSize: 28, fontWeight: '900', color: Colors.text.muted, lineHeight: 32 },
  hudCenter: { alignItems: 'center', gap: 2, paddingHorizontal: 8 },
  hudRoundLabel: { color: Colors.text.muted, fontSize: 8, fontWeight: '700', letterSpacing: 2 },
  hudRound: { color: Colors.brand.gold, fontSize: 15, fontWeight: '900', lineHeight: 18 },
  endBtn: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: Colors.brand.crimson + '55' },
  endBtnText: { color: Colors.brand.crimson, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Turn chip (gradient border trick)
  chipOuter: { alignItems: 'center', marginBottom: 10 },
  chipGradient: { borderRadius: 28, padding: 1.5 },
  chipInner: { backgroundColor: Colors.bg.dark, borderRadius: 26, paddingVertical: 10, paddingHorizontal: 36, alignItems: 'center' },
  chipLabel: { color: Colors.text.muted, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
  chipName: { color: Colors.text.primary, fontSize: 26, letterSpacing: 2, lineHeight: 30 },

  // Spark divider
  sparkWrap: { alignItems: 'center', marginBottom: 14 },
  sparkLine: { height: 1, width: '80%' },

  // Main
  main: { flex: 1, gap: 10 },

  // Choosing TOD grid
  todWrap: { flex: 1, justifyContent: 'center' },
  todGrid: { flexDirection: 'row', gap: 14 },

  // Timer
  timerBlock: { alignItems: 'center', gap: 10, paddingTop: 8 },
  skipTimer: { paddingVertical: 10, paddingHorizontal: 28, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.text.muted + '55' },
  skipTimerText: { color: Colors.text.muted, fontSize: 13, fontWeight: '600', letterSpacing: 1 },
});

const tod = StyleSheet.create({
  wrap:  { flex: 1 },
  card: {
    borderRadius: 20, borderWidth: 1.5, paddingVertical: 44, paddingHorizontal: 12,
    alignItems: 'center', gap: 12, overflow: 'hidden', position: 'relative',
  },
  strip:   { position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, opacity: 0.85 },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 50, backgroundColor: 'rgba(255,255,255,0.10)' },
  emoji:   { fontSize: 38 },
  label:   { fontSize: 28, letterSpacing: 4, lineHeight: 32 },
});

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, PanResponder, SafeAreaView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
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

// ─── TOD choice card ─────────────────────────────────────────────────────────

interface TODCardProps {
  type: 'truth' | 'dare';
  label: string;
  subtitle: string;
  onPress: () => void;
  exitAnim: Animated.Value;
}

function TODCard({ type, label, subtitle, onPress, exitAnim }: TODCardProps) {
  const pulse   = useRef(new Animated.Value(1)).current;
  const glow    = useRef(new Animated.Value(0.4)).current;
  const shimmer = useRef(new Animated.Value(-220)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 1400, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 1400, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1,   duration: 1600, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.4, duration: 1600, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 260, duration: 2400, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(shimmer, { toValue: -220, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);

  const isTruth = type === 'truth';
  const accent  = isTruth ? Colors.brand.neonBlue : Colors.brand.neonPink;
  const icon    = isTruth ? '😇' : '😈';
  const bgTop   = isTruth ? 'rgba(61,214,245,0.18)' : 'rgba(255,79,163,0.20)';
  const bgBot   = isTruth ? 'rgba(20,60,100,0.08)'  : 'rgba(120,0,60,0.08)';

  return (
    <Animated.View style={[tod.wrap, { transform: [{ scale: Animated.multiply(exitAnim, pulse) }], opacity: exitAnim }]}>
      {/* Outer glow ring */}
      <Animated.View style={[tod.glowRing, { borderColor: accent, opacity: glow }]} />

      <TouchableOpacity
        onPress={() => { isTruth ? Sounds.playClick() : Sounds.playDare(); onPress(); }}
        activeOpacity={0.88}
        style={tod.touchable}
      >
        <LinearGradient
          colors={[bgTop, bgBot]}
          start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
          style={[tod.card, { borderColor: accent + '70' }]}
        >
          {/* Glass shine */}
          <View style={tod.shine} />
          {/* Shimmer sweep */}
          <Animated.View style={[tod.shimmer, { transform: [{ translateX: shimmer }, { skewX: '-20deg' }] }]} />

          <Text style={tod.icon}>{icon}</Text>
          <Text style={[tod.label, { color: accent, fontFamily: 'BebasNeue_400Regular' }]}>{label}</Text>
          <View style={[tod.divider, { backgroundColor: accent + '55' }]} />
          <Text style={[tod.sub, { color: accent + 'AA' }]}>{subtitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Floating emoji reaction ──────────────────────────────────────────────────

interface ReactionProps { emoji: string; y: Animated.Value; opacity: Animated.Value; }
function EmojiReaction({ emoji, y, opacity }: ReactionProps) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { justifyContent: 'center', alignItems: 'center', zIndex: 99 },
        { transform: [{ translateY: y }], opacity },
      ]}
    >
      <Text style={{ fontSize: 72 }}>{emoji}</Text>
    </Animated.View>
  );
}

// ─── Main game screen ─────────────────────────────────────────────────────────

export default function GameScreen() {
  const {
    gameState, selectCardType, onRevealComplete, onTimerComplete,
    completeTurn, skipTurn, endGame, language,
  } = useGameStore();
  const t = (k: string) => tr(language, k);
  const cardRef = useRef<AnimatedCardRef>(null);
  const gs = gameState;

  const todExit   = useRef(new Animated.Value(1)).current;
  const [isExiting, setIsExiting] = useState(false);

  const [timerBonus, setTimerBonus] = useState(0);
  const [timerKey,   setTimerKey]   = useState(0);

  // Emoji reaction
  const [reactionEmoji,   setReactionEmoji]   = useState<string | null>(null);
  const reactionY       = useRef(new Animated.Value(0)).current;
  const reactionOpacity = useRef(new Animated.Value(0)).current;

  const prevPhaseRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    activateKeepAwakeAsync('game');
    return () => { deactivateKeepAwake('game'); };
  }, []);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    const cur  = gs?.phase;
    prevPhaseRef.current = cur;

    if (!gs) { router.replace('/'); return; }
    if (cur === 'game_over') { router.replace('/results'); return; }
    if (cur === 'forfeit')   { router.push('/forfeit'); return; }

    if (prev === 'timer_running' && cur === 'awaiting_done') {
      Sounds.playDing();
    }

    if (cur === 'choosing') {
      cardRef.current?.reset();
      todExit.setValue(1);
      setIsExiting(false);
      setTimerBonus(0);
      setTimerKey(k => k + 1);
    }
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
    if (isExiting) return;
    setIsExiting(true);
    Animated.timing(todExit, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      selectCardType(type);
      // Play reveal sound timed to mid-flip
      setTimeout(() => Sounds.playReveal(type === 'dare'), 220);
      setTimeout(() => cardRef.current?.flip(), 30);
    });
  };

  // Swipe gesture on the TOD choosing area
  const swipePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dy) < 60,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 55) {
          if (g.dx > 0) handleTypeSelect('dare');
          else          handleTypeSelect('truth');
        }
      },
    })
  ).current;

  const handleTimerComplete = () => { onTimerComplete(); };

  const baseTimerSeconds = gs.currentCard?.timerSeconds ?? 30;
  const effectiveTimer   = Math.max(5, baseTimerSeconds + timerBonus);

  const adjustTimer = (delta: number) => {
    const next = Math.max(5, effectiveTimer + delta);
    setTimerBonus(next - baseTimerSeconds);
    setTimerKey(k => k + 1);
  };

  const triggerReaction = (emoji: string, cb: () => void) => {
    setReactionEmoji(emoji);
    reactionY.setValue(0);
    reactionOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(reactionY, { toValue: -110, duration: 950, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(380),
        Animated.timing(reactionOpacity, { toValue: 0, duration: 570, useNativeDriver: true }),
      ]),
    ]).start(() => { setReactionEmoji(null); cb(); });
  };

  const handleDone = () => {
    Sounds.playDone();
    const emoji = gs.currentCard?.type === 'dare' ? '💋' : '✨';
    triggerReaction(emoji, completeTurn);
  };

  const isChoosing = gs.phase === 'choosing';
  const p1Skips   = gs.skipsRemaining[0];
  const p2Skips   = gs.skipsRemaining[1];
  const heartsFor = (n: number) => n === 0 ? '—' : '♡'.repeat(Math.max(0, n));

  return (
    <GradientBackground colors={Colors.gradient.splash}>
      <ParticleBackground />
      <SafeAreaView style={s.safe}>
        <View style={s.root}>

          {/* ── HUD ── */}
          <View style={s.hud}>
            <View style={s.hudPlayer}>
              <Text style={[s.hudName, gs.currentPlayerIndex === 0 && { color: Colors.brand.neonBlue }]} numberOfLines={1}>
                {gs.config.players[0].name}
              </Text>
              <Text style={[s.hudScore, gs.currentPlayerIndex === 0 && { color: Colors.brand.gold }]}>
                {gs.config.players[0].score}
              </Text>
              <Text style={[s.hudHearts, { color: p1Skips > 0 ? Colors.brand.neonPink : Colors.text.muted }]}>
                {heartsFor(p1Skips)}
              </Text>
            </View>

            <View style={s.hudCenter}>
              <Text style={s.hudRoundLabel}>{t('round').toUpperCase()}</Text>
              <Text style={s.hudRound}>{roundDisplay}</Text>
              <TouchableOpacity onPress={endGame} style={s.endBtn}>
                <Text style={s.endBtnText}>{t('endGame')}</Text>
              </TouchableOpacity>
            </View>

            <View style={[s.hudPlayer, s.hudRight]}>
              <Text style={[s.hudName, gs.currentPlayerIndex === 1 && { color: Colors.brand.neonPink }]} numberOfLines={1}>
                {gs.config.players[1].name}
              </Text>
              <Text style={[s.hudScore, gs.currentPlayerIndex === 1 && { color: Colors.brand.gold }]}>
                {gs.config.players[1].score}
              </Text>
              <Text style={[s.hudHearts, { color: p2Skips > 0 ? Colors.brand.neonPink : Colors.text.muted, textAlign: 'right' }]}>
                {heartsFor(p2Skips)}
              </Text>
            </View>
          </View>

          {/* ── Turn chip ── */}
          <View style={s.chipOuter}>
            <LinearGradient
              colors={[Colors.brand.neonPink, Colors.brand.neonBlue]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.chipGradient}
            >
              <View style={s.chipInner}>
                <Text style={s.chipLabel}>{t('yourTurn')}</Text>
                <Text style={[s.chipName, { fontFamily: 'BebasNeue_400Regular' }]}>{currentPlayer.name}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* ── Divider ── */}
          <View style={s.dividerWrap}>
            <LinearGradient
              colors={['transparent', Colors.brand.neonPink + '60', Colors.brand.gold + '70', Colors.brand.neonPink + '60', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.divider}
            />
          </View>

          {/* ── Main content ── */}
          <View style={s.main}>

            {/* AnimatedCard (hidden during choosing) */}
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

            {/* TOD choosing + swipe */}
            {isChoosing && (
              <View style={s.todOuter} {...swipePan.panHandlers}>
                <View style={s.todGrid}>
                  <TODCard type="truth" label={t('truth')} subtitle={language === 'he' ? 'ספר/י את האמת' : 'Confess it all'} onPress={() => handleTypeSelect('truth')} exitAnim={todExit} />
                  <TODCard type="dare"  label={t('dare')}  subtitle={language === 'he' ? 'אם תעיז...' : 'If you dare...'} onPress={() => handleTypeSelect('dare')}  exitAnim={todExit} />
                </View>
                <View style={s.swipeHintRow}>
                  <Text style={[s.swipeHint, { color: Colors.brand.neonBlue }]}>{'← ' + t('truth')}</Text>
                  <Text style={s.swipeHintMid}>{t('swipeHint')}</Text>
                  <Text style={[s.swipeHint, { color: Colors.brand.neonPink }]}>{t('dare') + ' →'}</Text>
                </View>
              </View>
            )}

            {/* Timer with adjustment */}
            {gs.phase === 'timer_running' && (
              <View style={s.timerBlock}>
                <View style={s.timerRow}>
                  <TouchableOpacity style={s.timerAdj} onPress={() => { Sounds.playClick(); adjustTimer(-15); }}>
                    <Text style={s.timerAdjText}>{t('timerSub')}</Text>
                  </TouchableOpacity>
                  <CountdownTimer key={timerKey} seconds={effectiveTimer} onComplete={handleTimerComplete} />
                  <TouchableOpacity style={[s.timerAdj, s.timerAdjAdd]} onPress={() => { Sounds.playClick(); adjustTimer(+15); }}>
                    <Text style={[s.timerAdjText, { color: '#6FCF4A' }]}>{t('timerAdd')}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={s.skipTimer} onPress={() => { Sounds.playClick(); handleTimerComplete(); }}>
                  <Text style={s.skipTimerText}>{t('skipTimer')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Done / Skip ── */}
          {gs.phase === 'awaiting_done' && (
            <ActionButtons
              onDone={handleDone}
              onSkip={skipTurn}
              skipsRemaining={gs.skipsRemaining[gs.currentPlayerIndex]}
              doneLabel={t('done')}
              skipLabel={t('skip')}
              skipsLeftLabel={t('skipsLeft')}
              noSkipsLabel={t('noSkipsLeft')}
            />
          )}

        </View>
      </SafeAreaView>

      {/* Floating emoji reaction */}
      {reactionEmoji && (
        <EmojiReaction emoji={reactionEmoji} y={reactionY} opacity={reactionOpacity} />
      )}
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 16, gap: 0 },

  hud: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  hudPlayer: { flex: 1, alignItems: 'flex-start' },
  hudRight:  { alignItems: 'flex-end' },
  hudName: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: Colors.text.muted, maxWidth: 100 },
  hudScore: { fontSize: 28, fontWeight: '900', color: Colors.text.muted, lineHeight: 32 },
  hudHearts: { fontSize: 12, marginTop: 2, letterSpacing: 2 },
  hudCenter: { alignItems: 'center', gap: 2, paddingHorizontal: 8 },
  hudRoundLabel: { color: Colors.text.muted, fontSize: 8, fontWeight: '700', letterSpacing: 2 },
  hudRound: { color: Colors.brand.gold, fontSize: 15, fontWeight: '900', lineHeight: 18 },
  endBtn: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: Colors.brand.neonPink + '40' },
  endBtnText: { color: Colors.brand.neonPink + 'CC', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  chipOuter: { alignItems: 'center', marginBottom: 10 },
  chipGradient: { borderRadius: 28, padding: 1.5 },
  chipInner: { backgroundColor: Colors.bg.dark, borderRadius: 26, paddingVertical: 10, paddingHorizontal: 36, alignItems: 'center' },
  chipLabel: { color: Colors.text.muted, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
  chipName: { color: Colors.text.primary, fontSize: 26, letterSpacing: 2, lineHeight: 30 },

  dividerWrap: { alignItems: 'center', marginBottom: 14 },
  divider: { height: 1, width: '80%' },

  main: { flex: 1, gap: 10 },

  todOuter: { flex: 1, justifyContent: 'center', gap: 14 },
  swipeHintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 4 },
  swipeHint: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, opacity: 0.65 },
  swipeHintMid: { color: Colors.text.muted, fontSize: 11, fontWeight: '600', opacity: 0.5 },
  todGrid: { flexDirection: 'row', gap: 14 },

  timerBlock: { alignItems: 'center', gap: 10, paddingTop: 8 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  timerAdj: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.brand.crimson + '60',
    backgroundColor: 'rgba(232,64,64,0.08)',
  },
  timerAdjAdd: { borderColor: '#6FCF4A60', backgroundColor: 'rgba(63,207,74,0.08)' },
  timerAdjText: { color: Colors.brand.crimson, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  skipTimer: { paddingVertical: 10, paddingHorizontal: 28, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.text.muted + '55' },
  skipTimerText: { color: Colors.text.muted, fontSize: 13, fontWeight: '600', letterSpacing: 1 },
});

const tod = StyleSheet.create({
  wrap: { flex: 1, position: 'relative' },
  glowRing: {
    position: 'absolute', inset: -6, borderRadius: 28,
    borderWidth: 2, zIndex: 0,
  } as any,
  touchable: { borderRadius: 22, overflow: 'hidden', flex: 1, zIndex: 1 },
  card: {
    borderRadius: 22, borderWidth: 1.5,
    paddingTop: 32, paddingBottom: 28, paddingHorizontal: 12,
    alignItems: 'center', gap: 8, overflow: 'hidden', position: 'relative', flex: 1,
  },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 60, backgroundColor: 'rgba(255,255,255,0.06)' },
  icon:    { fontSize: 46, marginBottom: 4 },
  label:   { fontSize: 32, letterSpacing: 4, lineHeight: 36 },
  divider: { width: '50%', height: 1, marginVertical: 4 },
  sub:     { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
});

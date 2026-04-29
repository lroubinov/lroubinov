import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionButtons from '../src/components/game/ActionButtons';
import CardReveal from '../src/components/game/CardReveal';
import CountdownTimer from '../src/components/game/CountdownTimer';
import ScoreTracker from '../src/components/game/ScoreTracker';
import TruthDareButtons from '../src/components/game/TruthDareButtons';
import AnimatedCard, { AnimatedCardRef } from '../src/components/ui/AnimatedCard';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

export default function GameScreen() {
  const { gameState, selectCardType, onRevealComplete, onTimerComplete, completeTurn, skipTurn, endGame, language } = useGameStore();
  const t = (k: string) => tr(language, k);
  const isRtl = language === 'he';
  const cardRef = useRef<AnimatedCardRef>(null);
  const gs = gameState;

  useEffect(() => {
    if (!gs) { router.replace('/'); return; }
    if (gs.phase === 'game_over') router.replace('/results');
    if (gs.phase === 'forfeit') router.push('/forfeit');
  }, [gs?.phase]);

  if (!gs) return null;

  const currentPlayer = gs.config.players[gs.currentPlayerIndex];
  const partnerIndex: 0 | 1 = gs.currentPlayerIndex === 0 ? 1 : 0;
  const partnerGender = gs.config.players[partnerIndex].gender;

  const handleTypeSelect = (type: 'truth' | 'dare') => {
    selectCardType(type);
    setTimeout(() => cardRef.current?.flip(), 50);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.root}>

          {/* Header */}
          <View style={styles.header}>
            <ScoreTracker players={gs.config.players} turnNumber={gs.turnNumber} totalRounds={gs.config.totalRounds} />
            <TouchableOpacity style={styles.endBtn} onPress={endGame}>
              <Text style={styles.endBtnText}>{t('endGame')}</Text>
            </TouchableOpacity>
          </View>

          {/* Player banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerLabel}>{t('yourTurn')}</Text>
            <Text style={styles.bannerName}>{currentPlayer.name}</Text>
          </View>

          {/* Card area — flex:1 */}
          <View style={styles.cardArea}>
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

            {gs.phase === 'revealing' && (
              <Text style={[styles.hint, isRtl && styles.rtl]}>{t('flipping')}</Text>
            )}

            {gs.phase === 'timer_running' && (
              <View style={styles.timerBlock}>
                <Text style={[styles.dareLabel, isRtl && styles.rtl]}>{t('completeTheDare')}</Text>
                <CountdownTimer seconds={gs.currentCard?.timerSeconds ?? 30} onComplete={onTimerComplete} />
                <TouchableOpacity style={styles.skipTimer} onPress={onTimerComplete}>
                  <Text style={styles.skipTimerText}>{t('skipTimer')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bottom controls */}
          <View style={styles.bottom}>
            {gs.phase === 'choosing' && (
              <TruthDareButtons
                onSelect={handleTypeSelect}
                truthLabel={t('truth')}
                dareLabel={t('dare')}
              />
            )}
            {gs.phase === 'awaiting_done' && (
              <ActionButtons
                onDone={completeTurn}
                onSkip={skipTurn}
                skipsRemaining={gs.skipsRemaining}
                doneLabel={t('done')}
                skipLabel={t('skip')}
                skipsLeftLabel={t('skipsLeft')}
                noSkipsLabel={t('noSkipsLeft')}
              />
            )}
          </View>

        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  endBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.brand.crimson + '60' },
  endBtnText: { color: Colors.brand.crimson, fontSize: 11, fontWeight: '700' },
  banner: { backgroundColor: Colors.bg.surface, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: Colors.brand.purpleLight + '40' },
  bannerLabel: { color: Colors.text.muted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  bannerName: { color: Colors.brand.gold, fontSize: 24, fontWeight: '900' },
  cardArea: { flex: 1, justifyContent: 'center', gap: 10 },
  hint: { color: Colors.text.muted, textAlign: 'center', fontSize: 14, marginTop: 8 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  timerBlock: { alignItems: 'center', gap: 8, marginTop: 8 },
  dareLabel: { color: Colors.brand.rose, fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  skipTimer: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: Colors.text.muted },
  skipTimerText: { color: Colors.text.muted, fontSize: 13, fontWeight: '600' },
  bottom: { minHeight: 110, justifyContent: 'flex-end' },
});

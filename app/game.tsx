import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionButtons from '../src/components/game/ActionButtons';
import CardReveal from '../src/components/game/CardReveal';
import CountdownTimer from '../src/components/game/CountdownTimer';
import PlayerBanner from '../src/components/game/PlayerBanner';
import ScoreTracker from '../src/components/game/ScoreTracker';
import TruthDareButtons from '../src/components/game/TruthDareButtons';
import AnimatedCard, { AnimatedCardRef } from '../src/components/ui/AnimatedCard';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

export default function GameScreen() {
  const { gameState, selectCardType, onRevealComplete, onTimerComplete, completeTurn, skipTurn, endGame, language } = useGameStore();
  const t = (key: string) => tr(language, key);
  const isRtl = language === 'he';
  const cardRef = useRef<AnimatedCardRef>(null);

  const gs = gameState;

  useEffect(() => {
    if (!gs) {
      router.replace('/');
      return;
    }
    if (gs.phase === 'game_over') {
      router.replace('/results');
    }
    if (gs.phase === 'forfeit') {
      router.push('/forfeit');
    }
  }, [gs?.phase]);

  if (!gs) return null;

  const currentPlayer = gs.config.players[gs.currentPlayerIndex];

  const handleTypeSelect = (type: 'truth' | 'dare') => {
    selectCardType(type);
    setTimeout(() => cardRef.current?.flip(), 50);
  };

  const showCard = gs.phase !== 'choosing';
  const showTimer = gs.phase === 'timer_running';
  const showActions = gs.phase === 'awaiting_done';
  const isUnlimited = gs.config.totalRounds === null;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <ScoreTracker
            players={gs.config.players}
            turnNumber={gs.turnNumber}
            totalRounds={gs.config.totalRounds}
          />
          <TouchableOpacity style={styles.endBtn} onPress={endGame}>
            <Text style={styles.endBtnText}>{t('endGame')}</Text>
          </TouchableOpacity>
        </View>

        <PlayerBanner name={currentPlayer.name} />

        {/* Card area */}
        <View style={styles.cardArea}>
          <AnimatedCard
            ref={cardRef}
            frontContent={gs.currentCard ? <CardReveal card={gs.currentCard} /> : null}
            onFlipComplete={onRevealComplete}
          />
        </View>

        {/* Choose phase */}
        {gs.phase === 'choosing' && (
          <TruthDareButtons onSelect={handleTypeSelect} />
        )}

        {/* Revealing phase */}
        {gs.phase === 'revealing' && (
          <Text style={[styles.hint, isRtl && styles.rtl]}>{t('flipping')}</Text>
        )}

        {/* Timer */}
        {showTimer && (
          <>
            <Text style={[styles.dareLabel, isRtl && styles.rtl]}>{t('completeTheDare')}</Text>
            <CountdownTimer
              seconds={gs.currentCard?.timerSeconds ?? 30}
              onComplete={onTimerComplete}
            />
            <TouchableOpacity style={styles.skipTimer} onPress={onTimerComplete}>
              <Text style={styles.skipTimerText}>{t('skipTimer')}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Action buttons */}
        {showActions && (
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
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 48,
    minHeight: '100%',
  },
  topBar: {
    gap: 8,
  },
  endBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.brand.crimson + '60',
    marginTop: 4,
  },
  endBtnText: {
    color: Colors.brand.crimson,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardArea: {
    marginVertical: 8,
  },
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  hint: {
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  dareLabel: {
    color: Colors.brand.rose,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 16,
    letterSpacing: 1,
  },
  skipTimer: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.text.muted,
  },
  skipTimerText: {
    color: Colors.text.muted,
    fontSize: 13,
    fontWeight: '600',
  },
});

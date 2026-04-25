import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { useGameStore } from '../src/store/gameStore';

export default function ResultsScreen() {
  const { gameState, resetGame, startGame } = useGameStore();

  const winnerScale = useRef(new Animated.Value(0.5)).current;
  const winnerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(winnerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(winnerScale, { toValue: 1, damping: 10, useNativeDriver: true }),
      ]).start();
    }, 200);
  }, []);

  const winnerStyle = { opacity: winnerOpacity, transform: [{ scale: winnerScale }] };

  if (!gameState) {
    router.replace('/');
    return null;
  }

  const [p1, p2] = gameState.config.players;
  const isDraw = p1.score === p2.score;
  const winner = isDraw ? null : p1.score > p2.score ? p1 : p2;

  const handlePlayAgain = () => {
    startGame();
    router.replace('/game');
  };

  const handleNewGame = () => {
    resetGame();
    router.replace('/');
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Game Over 🎉</Text>

        <Animated.View style={[styles.winnerCard, winnerStyle]}>
          {isDraw ? (
            <>
              <Text style={styles.drawEmoji}>💋</Text>
              <Text style={styles.drawText}>It's a draw!</Text>
              <Text style={styles.drawSub}>You both win tonight...</Text>
            </>
          ) : (
            <>
              <Text style={styles.crownEmoji}>👑</Text>
              <Text style={styles.winnerLabel}>Winner</Text>
              <Text style={styles.winnerName}>{winner!.name}</Text>
              <Text style={styles.winnerScore}>{winner!.score} points</Text>
            </>
          )}
        </Animated.View>

        {/* Scores */}
        <View style={styles.scoresSection}>
          <Text style={styles.scoresTitle}>Final Scores</Text>
          {[p1, p2].map((p) => (
            <View key={p.id} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{p.name}</Text>
              <View style={styles.scoreRight}>
                <Text style={styles.scorePoints}>{p.score} pts</Text>
                {p.forfeitsOwed > 0 && (
                  <Text style={styles.forfeits}>{p.forfeitsOwed} forfeit{p.forfeitsOwed > 1 ? 's' : ''}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <GlowButton label="Play Again 🔥" onPress={handlePlayAgain} style={styles.btn} fontSize={17} />
          <GlowButton
            label="New Game"
            onPress={handleNewGame}
            colors={['#1E0035', '#2D0050']}
            style={styles.btn}
            fontSize={17}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    paddingBottom: 60,
    gap: 28,
    alignItems: 'center',
    minHeight: '100%',
    justifyContent: 'center',
  },
  title: {
    color: Colors.brand.gold,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  winnerCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.brand.gold + '40',
    gap: 8,
  },
  crownEmoji: { fontSize: 48 },
  drawEmoji: { fontSize: 48 },
  winnerLabel: {
    color: Colors.text.muted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  winnerName: {
    color: Colors.brand.gold,
    fontSize: 32,
    fontWeight: '900',
  },
  winnerScore: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
  drawText: {
    color: Colors.brand.pink,
    fontSize: 28,
    fontWeight: '900',
  },
  drawSub: {
    color: Colors.text.secondary,
    fontSize: 15,
    fontStyle: 'italic',
  },
  scoresSection: {
    width: '100%',
    gap: 12,
  },
  scoresTitle: {
    color: Colors.text.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderRadius: 12,
    padding: 16,
  },
  scoreName: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  scoreRight: {
    alignItems: 'flex-end',
  },
  scorePoints: {
    color: Colors.brand.gold,
    fontSize: 18,
    fontWeight: '800',
  },
  forfeits: {
    color: Colors.brand.crimson,
    fontSize: 12,
    marginTop: 2,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
  },
});

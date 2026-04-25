import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ForfeitCard from '../src/components/forfeit/ForfeitCard';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { useGameStore } from '../src/store/gameStore';

export default function ForfeitScreen() {
  const { gameState, completeForfeit } = useGameStore();

  if (!gameState?.pendingForfeit) {
    router.back();
    return null;
  }

  const currentPlayer = gameState.config.players[gameState.currentPlayerIndex];

  const handleAccept = () => {
    completeForfeit();
    router.back();
  };

  return (
    <GradientBackground colors={['#1A0005', '#0A0010', '#0A0010']}>
      <View style={styles.container}>
        <Text style={styles.header}>Forfeit Time ⚡</Text>
        <Text style={styles.playerText}>
          This is your consequence, <Text style={styles.playerName}>{currentPlayer.name}</Text>
        </Text>

        <ForfeitCard forfeit={gameState.pendingForfeit} />

        <GlowButton
          label="I Accept 😈"
          onPress={handleAccept}
          colors={['#7D0020', '#3D0010']}
          style={styles.cta}
          fontSize={18}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    gap: 24,
    alignItems: 'center',
  },
  header: {
    color: Colors.brand.crimson,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  playerText: {
    color: Colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  playerName: {
    color: Colors.brand.gold,
    fontWeight: '800',
  },
  cta: {
    width: '100%',
    marginTop: 8,
  },
});

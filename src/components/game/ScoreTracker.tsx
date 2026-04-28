import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Player } from '../../data/types';

interface Props {
  players: [Player, Player];
  turnNumber: number;
  totalRounds: number | null;
}

export default function ScoreTracker({ players, turnNumber, totalRounds }: Props) {
  const currentRound = Math.ceil(turnNumber / 2);
  const roundDisplay = totalRounds === null
    ? `Round ${currentRound} / ∞`
    : `Round ${Math.min(currentRound, totalRounds)} / ${totalRounds}`;

  return (
    <View style={styles.row}>
      <View style={styles.playerScore}>
        <Text style={styles.playerName}>{players[0].name}</Text>
        <Text style={styles.score}>{players[0].score} pts</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.round}>{roundDisplay}</Text>
      </View>
      <View style={[styles.playerScore, styles.right]}>
        <Text style={styles.playerName}>{players[1].name}</Text>
        <Text style={styles.score}>{players[1].score} pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  playerScore: {
    flex: 1,
    alignItems: 'flex-start',
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  playerName: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  score: {
    color: Colors.brand.gold,
    fontSize: 18,
    fontWeight: '800',
  },
  round: {
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

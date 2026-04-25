import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../data/types';
import SpiceBadge from '../ui/SpiceBadge';

interface Props {
  card: Card;
}

export default function CardReveal({ card }: Props) {
  const typeLabel = card.type === 'truth' ? '💬 TRUTH' : '🔥 DARE';
  const typeColor = card.type === 'truth' ? Colors.brand.rose : Colors.brand.crimson;

  return (
    <View style={styles.container}>
      <Text style={[styles.typeLabel, { color: typeColor }]}>{typeLabel}</Text>
      <SpiceBadge level={card.level} />
      <Text style={styles.cardText}>{card.text}</Text>
      {card.type === 'dare' && (
        <Text style={styles.timerNote}>⏱ {card.timerSeconds ?? 30} seconds</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  cardText: {
    color: Colors.text.primary,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '500',
  },
  timerNote: {
    color: Colors.text.muted,
    fontSize: 12,
    marginTop: 4,
  },
});

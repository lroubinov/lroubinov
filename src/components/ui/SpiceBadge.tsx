import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { SpiceLevel } from '../../data/types';

const LABELS: Record<SpiceLevel, string> = {
  hot: '🌶️ Hot',
  scorching: '💥 Scorching',
  hardcore: '🔥 Hardcore',
};

interface Props {
  level: SpiceLevel;
}

export default function SpiceBadge({ level }: Props) {
  const theme = Colors.level[level];
  return (
    <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.text }]}>{LABELS[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

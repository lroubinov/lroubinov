import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  name: string;
}

export default function PlayerBanner({ name }: Props) {
  return (
    <LinearGradient colors={['#1E0035', '#2D0050']} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Text style={styles.label}>YOUR TURN</Text>
      <Text style={styles.name}>{name}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.purpleLight + '60',
    marginBottom: 16,
  },
  label: {
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  name: {
    color: Colors.brand.gold,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
});

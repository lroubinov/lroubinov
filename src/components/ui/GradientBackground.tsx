import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTheme } from '../../constants/themes';
import { useGameStore } from '../../store/gameStore';

interface Props {
  children: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
}

export default function GradientBackground({ children, colors, style }: Props) {
  const theme = useGameStore(s => s.theme);
  const gradient = colors ?? getTheme(theme).gradient;
  return (
    <LinearGradient colors={gradient} style={[styles.gradient, style]}>
      <SafeAreaView style={styles.safe}>{children}</SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
});

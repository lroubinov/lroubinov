import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
}

export default function GradientBackground({ children, colors = Colors.gradient.splash, style }: Props) {
  return (
    <LinearGradient colors={colors} style={[styles.gradient, style]}>
      <SafeAreaView style={styles.safe}>{children}</SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
});

import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  label: string;
  onPress: () => void;
  colors?: readonly [string, string, ...string[]];
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fontSize?: number;
}

export default function GlowButton({ label, onPress, colors = Colors.gradient.gold, disabled, loading, style, fontSize = 18 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: disabled ? 0.4 : glow }, style]}>
      <TouchableOpacity onPress={handlePress} disabled={disabled || loading} activeOpacity={0.85}>
        <LinearGradient colors={colors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {loading ? (
            <ActivityIndicator color={Colors.text.primary} />
          ) : (
            <Text style={[styles.label, { fontSize }]}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.bg.deepest,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

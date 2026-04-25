import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GlowButton({ label, onPress, colors = Colors.gradient.gold, disabled, loading, style, fontSize = 18 }: Props) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.6);

  React.useEffect(() => {
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0.6, { duration: 1200 })), -1, false);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.4 : 1,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 12 }, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[animStyle, style]}
    >
      <LinearGradient colors={colors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {loading ? (
          <ActivityIndicator color={Colors.text.primary} />
        ) : (
          <Text style={[styles.label, { fontSize }]}>{label}</Text>
        )}
      </LinearGradient>
    </AnimatedTouchable>
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

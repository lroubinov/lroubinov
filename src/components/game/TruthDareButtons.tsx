import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { CardType } from '../../data/types';

interface Props {
  onSelect: (type: CardType) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function BigButton({ label, emoji, colors, onPress }: { label: string; emoji: string; colors: readonly [string, string]; onPress: () => void }) {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.03, { duration: 900 }), withTiming(1, { duration: 900 })), -1, false);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <AnimatedTouchable onPress={handlePress} style={[styles.buttonWrap, animStyle]} activeOpacity={0.9}>
      <LinearGradient colors={colors} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

export default function TruthDareButtons({ onSelect }: Props) {
  return (
    <View style={styles.row}>
      <BigButton
        label="TRUTH"
        emoji="💬"
        colors={Colors.gradient.button.truth}
        onPress={() => onSelect('truth')}
      />
      <BigButton
        label="DARE"
        emoji="🔥"
        colors={Colors.gradient.button.dare}
        onPress={() => onSelect('dare')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  buttonWrap: {
    flex: 1,
  },
  button: {
    paddingVertical: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.purpleLight + '30',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  label: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
});

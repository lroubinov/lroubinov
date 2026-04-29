import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { CardType } from '../../data/types';

interface Props {
  truthLabel: string;
  dareLabel: string;
  onSelect: (type: CardType) => void;
}

function BigButton({ label, emoji, colors, onPress }: { label: string; emoji: string; colors: readonly [string, string]; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.buttonWrap, { transform: [{ scale: Animated.multiply(scale, pulse) }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient colors={colors} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TruthDareButtons({ onSelect, truthLabel, dareLabel }: Props) {
  return (
    <View style={styles.row}>
      <BigButton label={truthLabel} emoji="💬" colors={Colors.gradient.button.truth} onPress={() => onSelect('truth')} />
      <BigButton label={dareLabel} emoji="🔥" colors={Colors.gradient.button.dare} onPress={() => onSelect('dare')} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, marginTop: 24 },
  buttonWrap: { flex: 1 },
  button: {
    paddingVertical: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.purpleLight + '30',
  },
  emoji: { fontSize: 36, marginBottom: 8 },
  label: { color: Colors.text.primary, fontSize: 18, fontWeight: '900', letterSpacing: 3 },
});

import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { useGameStore } from '../src/store/gameStore';

export default function HomeScreen() {
  const setPlayerNames = useGameStore((s) => s.setPlayerNames);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');

  const titleGlow = useSharedValue(0.7);
  React.useEffect(() => {
    titleGlow.value = withRepeat(withSequence(withTiming(1, { duration: 1500 }), withTiming(0.7, { duration: 1500 })), -1, false);
  }, []);
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleGlow.value }));

  const valid = name1.trim().length > 0 && name2.trim().length > 0;

  const handleStart = () => {
    setPlayerNames(name1.trim(), name2.trim());
    router.push('/level-select');
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.flame}>🔥</Text>
          <Animated.Text style={[styles.title, titleStyle]}>IGNITE</Animated.Text>
          <Text style={styles.tagline}>Your night. Your rules.</Text>
        </View>

        {/* Name inputs */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Player 1</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name..."
            placeholderTextColor={Colors.text.muted}
            value={name1}
            onChangeText={(t) => setName1(t.slice(0, 20))}
            autoCorrect={false}
          />
          <Text style={styles.heart}>♥</Text>
          <Text style={styles.inputLabel}>Player 2</Text>
          <TextInput
            style={styles.input}
            placeholder="Their name..."
            placeholderTextColor={Colors.text.muted}
            value={name2}
            onChangeText={(t) => setName2(t.slice(0, 20))}
            autoCorrect={false}
          />
        </View>

        {/* CTA */}
        <GlowButton
          label="Start Game"
          onPress={handleStart}
          disabled={!valid}
          style={styles.cta}
          fontSize={20}
        />
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 32,
  },
  titleSection: {
    alignItems: 'center',
    gap: 6,
  },
  flame: {
    fontSize: 56,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.brand.gold,
    letterSpacing: 10,
  },
  tagline: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  inputSection: {
    gap: 10,
    alignItems: 'center',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    color: Colors.text.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.bg.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: Colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.brand.purpleLight + '40',
  },
  heart: {
    color: Colors.brand.pink,
    fontSize: 24,
    marginVertical: 4,
  },
  cta: {
    width: '100%',
  },
});

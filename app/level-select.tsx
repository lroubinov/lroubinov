import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { SpiceLevel } from '../src/data/types';
import { useGameStore } from '../src/store/gameStore';

interface LevelOption {
  level: SpiceLevel;
  emoji: string;
  name: string;
  description: string;
  color: string;
  border: string;
}

const LEVELS: LevelOption[] = [
  { level: 'hot', emoji: '🌶️', name: 'Hot', description: 'Sensual & teasing — the slow burn. Flirty dares and intimate truths.', color: Colors.level.hot.bg, border: Colors.level.hot.border },
  { level: 'scorching', emoji: '💥', name: 'Scorching', description: 'Explicit — things will heat up. Bold truths, steamy dares.', color: Colors.level.scorching.bg, border: Colors.level.scorching.border },
  { level: 'hardcore', emoji: '🔥', name: 'Hardcore', description: 'No limits — for the brave. Adults only. 18+', color: Colors.level.hardcore.bg, border: Colors.level.hardcore.border },
];

export default function LevelSelectScreen() {
  const [selected, setSelected] = useState<SpiceLevel[]>(['hot']);
  const { setEnabledLevels, startGame } = useGameStore();

  const toggle = (level: SpiceLevel) => {
    setSelected((prev) => {
      if (prev.includes(level)) {
        const next = prev.filter((l) => l !== level);
        return next.length === 0 ? ['hot'] : next;
      }
      return [...prev, level];
    });
  };

  const handlePlay = () => {
    setEnabledLevels(selected);
    startGame();
    router.replace('/game');
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Choose Your Heat</Text>
        <Text style={styles.sub}>Mix levels for maximum fun</Text>

        {LEVELS.map((opt) => {
          const isOn = selected.includes(opt.level);
          return (
            <TouchableOpacity
              key={opt.level}
              onPress={() => toggle(opt.level)}
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: opt.color, borderColor: isOn ? opt.border : opt.border + '30' }]}
            >
              <View style={styles.cardRow}>
                <Text style={styles.emoji}>{opt.emoji}</Text>
                <View style={styles.cardText}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.levelName, { color: isOn ? Colors.text.primary : Colors.text.muted }]}>{opt.name}</Text>
                    {opt.level === 'hardcore' && <Text style={styles.badge18}>18+</Text>}
                  </View>
                  <Text style={styles.description}>{opt.description}</Text>
                </View>
                <View style={[styles.check, { borderColor: opt.border, backgroundColor: isOn ? opt.border : 'transparent' }]}>
                  {isOn && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <GlowButton label="Let's Play 🔥" onPress={handlePlay} style={styles.cta} fontSize={20} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
  heading: {
    color: Colors.brand.gold,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  sub: {
    color: Colors.text.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: -8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '800',
  },
  badge18: {
    backgroundColor: Colors.brand.crimson,
    color: Colors.text.primary,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    color: Colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: Colors.bg.deepest,
    fontWeight: '900',
    fontSize: 14,
  },
  cta: {
    marginTop: 8,
  },
});

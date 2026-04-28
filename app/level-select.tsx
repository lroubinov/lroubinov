import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { SpiceLevel } from '../src/data/types';
import { tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

interface LevelOption {
  level: SpiceLevel;
  emoji: string;
  nameKey: string;
  descKey: string;
  color: string;
  border: string;
}

const LEVELS: LevelOption[] = [
  { level: 'hot', emoji: '🌶️', nameKey: 'hotName', descKey: 'hotDesc', color: Colors.level.hot.bg, border: Colors.level.hot.border },
  { level: 'scorching', emoji: '💥', nameKey: 'scorchingName', descKey: 'scorchingDesc', color: Colors.level.scorching.bg, border: Colors.level.scorching.border },
  { level: 'hardcore', emoji: '🔥', nameKey: 'hardcoreName', descKey: 'hardcoreDesc', color: Colors.level.hardcore.bg, border: Colors.level.hardcore.border },
];

export default function LevelSelectScreen() {
  const [selected, setSelected] = useState<SpiceLevel[]>(['hot']);
  const { setEnabledLevels, startGame, language } = useGameStore();
  const t = (key: string) => tr(language, key);
  const isRtl = language === 'he';

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
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.heading, isRtl && styles.rtl]}>{t('chooseHeat')}</Text>
        <Text style={[styles.sub, isRtl && styles.rtl]}>{t('mixLevels')}</Text>

        {LEVELS.map((opt) => {
          const isOn = selected.includes(opt.level);
          return (
            <TouchableOpacity
              key={opt.level}
              onPress={() => toggle(opt.level)}
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: opt.color, borderColor: isOn ? opt.border : opt.border + '30' }]}
            >
              <View style={[styles.cardRow, isRtl && styles.rowRtl]}>
                <Text style={styles.emoji}>{opt.emoji}</Text>
                <View style={styles.cardText}>
                  <View style={[styles.nameRow, isRtl && styles.rowRtl]}>
                    <Text style={[styles.levelName, { color: isOn ? Colors.text.primary : Colors.text.muted }, isRtl && styles.rtl]}>{t(opt.nameKey)}</Text>
                    {opt.level === 'hardcore' && <Text style={styles.badge18}>18+</Text>}
                  </View>
                  <Text style={[styles.description, isRtl && styles.rtl]}>{t(opt.descKey)}</Text>
                </View>
                <View style={[styles.check, { borderColor: opt.border, backgroundColor: isOn ? opt.border : 'transparent' }]}>
                  {isOn && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <GlowButton label={t('letsPlay')} onPress={handlePlay} style={styles.cta} fontSize={20} />
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  back: {},
  backText: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
  settingsBtn: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 22,
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
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
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

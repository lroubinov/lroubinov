import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GradientBackground from '../src/components/ui/GradientBackground';
import ParticleBackground from '../src/components/ui/ParticleBackground';
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
  glow: string;
  style: 'hot' | 'burn' | 'xtreme';
}

const LEVELS: LevelOption[] = [
  {
    level: 'hot', emoji: '🌶️', nameKey: 'hotName', descKey: 'hotDesc',
    color: Colors.level.hot.bg, border: Colors.level.hot.border, glow: Colors.level.hot.glow, style: 'hot',
  },
  {
    level: 'scorching', emoji: '💥', nameKey: 'scorchingName', descKey: 'scorchingDesc',
    color: Colors.level.scorching.bg, border: Colors.level.scorching.border, glow: Colors.level.scorching.glow, style: 'burn',
  },
  {
    level: 'hardcore', emoji: '🔥', nameKey: 'hardcoreName', descKey: 'hardcoreDesc',
    color: Colors.level.hardcore.bg, border: Colors.level.hardcore.border, glow: Colors.level.hardcore.glow, style: 'xtreme',
  },
];

// Animated CTA button with shimmer + glass shine
function FireButton({ label, onPress }: { label: string; onPress: () => void }) {
  const shimmer = useRef(new Animated.Value(-200)).current;
  const scale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 400, duration: 1800, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(shimmer, { toValue: -200, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#FF8500', '#FF4500', '#D42800']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.fireBtn}
        >
          {/* Glass shine on top half */}
          <View style={s.fireBtnShine} />
          {/* Shimmer sweep */}
          <Animated.View style={[s.fireBtnShimmer, { transform: [{ translateX: shimmer }, { skewX: '-15deg' }] }]} />
          <Text style={s.fireBtnIcon}>🔥</Text>
          <Text style={[s.fireBtnText, { fontFamily: 'BebasNeue_400Regular' }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
    <GradientBackground colors={Colors.gradient.splash}>
      <ParticleBackground />

      {/* Ambient orbs */}
      <View style={[s.orb, { width: 240, height: 240, backgroundColor: 'rgba(255,69,0,0.10)', top: -60, right: -60 }]} />
      <View style={[s.orb, { width: 180, height: 180, backgroundColor: 'rgba(192,38,211,0.08)', bottom: 80, left: -40 }]} />

      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Top nav */}
        <View style={s.topNav}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backArrow}>{isRtl ? '→' : '←'}</Text>
            <Text style={[s.backText, { fontFamily: 'Exo2_700Bold' }]}>{t('back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.settingsBtn} onPress={() => router.push('/settings')}>
            <Text style={s.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={[s.header, isRtl && s.headerRtl]}>
          <Text style={[s.headerTitle, { fontFamily: 'BebasNeue_400Regular' }, isRtl && s.rtl]}>
            {t('chooseHeat')}
          </Text>
          <Text style={[s.headerSub, { fontFamily: 'Exo2_700Bold' }, isRtl && s.rtl]}>
            {t('mixLevels')}
          </Text>
        </View>

        {/* Level cards */}
        <View style={s.levelList}>
          {LEVELS.map((opt) => {
            const isOn = selected.includes(opt.level);
            const isHardcore = opt.level === 'hardcore';

            return (
              <TouchableOpacity
                key={opt.level}
                activeOpacity={0.85}
                onPress={() => toggle(opt.level)}
                style={[
                  s.card,
                  { borderColor: isOn ? opt.border + 'AA' : opt.border + '33' },
                  isOn && { backgroundColor: opt.color, shadowColor: opt.border, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
                ]}
              >
                {/* Left glow strip when selected (hardcore style) */}
                {isOn && (
                  <View style={[s.glowStrip, { backgroundColor: opt.border }]} />
                )}

                {/* 18+ badge */}
                {isHardcore && (
                  <View style={s.badge18Wrap}>
                    <Text style={[s.badge18Text, { fontFamily: 'Exo2_700Bold' }]}>18+</Text>
                  </View>
                )}

                {/* Radio circle */}
                <View style={[
                  s.radio,
                  { borderColor: opt.border },
                  isOn && { backgroundColor: opt.border },
                ]}>
                  {isOn && <Text style={s.radioCheck}>✓</Text>}
                </View>

                {/* Text content */}
                <View style={[s.cardContent, isRtl && s.cardContentRtl]}>
                  <Text style={[s.cardName, { color: opt.color === 'rgba(255,255,255,0.05)' ? opt.border : opt.border }, isRtl && s.rtl, { fontFamily: 'BebasNeue_400Regular' }]}>
                    {t(opt.nameKey)}
                  </Text>
                  <Text style={[s.cardDesc, { fontFamily: 'Exo2_700Bold' }, isRtl && s.rtl]}>
                    {t(opt.descKey)}
                  </Text>
                </View>

                {/* Emoji */}
                <Text style={[s.cardEmoji, isOn && { shadowColor: opt.border, shadowOpacity: 0.8, shadowRadius: 8 }]}>
                  {opt.emoji}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spark divider */}
        <View style={s.sparkWrap}>
          <LinearGradient
            colors={['transparent', Colors.brand.fireHot, Colors.brand.gold, Colors.brand.fireHot, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.sparkLine}
          />
        </View>

        {/* Fire CTA */}
        <FireButton label={t('letsPlay')} onPress={handlePlay} />

      </ScrollView>
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48, gap: 0 },
  orb: { position: 'absolute', borderRadius: 999 },

  // Top nav
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { color: 'rgba(245,238,255,0.42)', fontSize: 16, fontWeight: '900' },
  backText: { color: 'rgba(245,238,255,0.42)', fontSize: 13, letterSpacing: 1 },
  settingsBtn: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 17 },

  // Header
  header: { marginBottom: 24 },
  headerRtl: { alignItems: 'flex-end' },
  headerTitle: { fontSize: 34, letterSpacing: 2, color: Colors.brand.gold, lineHeight: 38 },
  headerSub: { fontSize: 14, color: Colors.text.muted, letterSpacing: 0.5, marginTop: 4 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },

  // Level list
  levelList: { gap: 12, marginBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22, borderWidth: 1.5,
    padding: 18, position: 'relative', overflow: 'hidden',
  },
  glowStrip: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
    borderTopLeftRadius: 22, borderBottomLeftRadius: 22,
    opacity: 0.9,
  },
  badge18Wrap: {
    position: 'absolute', top: 10, right: 14,
    backgroundColor: Colors.brand.ember, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badge18Text: { color: '#fff', fontSize: 9, letterSpacing: 0.5 },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  radioCheck: { color: '#fff', fontSize: 12, fontWeight: '900' },
  cardContent: { flex: 1, gap: 3 },
  cardContentRtl: { alignItems: 'flex-end' },
  cardName: { fontSize: 22, letterSpacing: 1, lineHeight: 26 },
  cardDesc: { fontSize: 13, color: Colors.text.muted, lineHeight: 18 },
  cardEmoji: { fontSize: 30, flexShrink: 0 },

  // Spark divider
  sparkWrap: { alignItems: 'center', marginBottom: 20 },
  sparkLine: { height: 1, width: '60%' },

  // Fire CTA button
  fireBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 19, borderRadius: 22, overflow: 'hidden',
    shadowColor: Colors.brand.fire, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  fireBtnShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)', borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  fireBtnShimmer: {
    position: 'absolute', top: 0, bottom: 0, width: 60,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  fireBtnIcon: { fontSize: 20 },
  fireBtnText: { fontSize: 24, letterSpacing: 4, color: '#fff' },
});

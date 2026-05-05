import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GradientBackground from '../src/components/ui/GradientBackground';
import ParticleBackground from '../src/components/ui/ParticleBackground';
import { Colors } from '../src/constants/colors';
import { tr } from '../src/i18n';
import { Sounds } from '../src/utils/sounds';
import { useGameStore } from '../src/store/gameStore';

function BlinkDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.2, duration: 750, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[s.dot, { backgroundColor: color, shadowColor: color, opacity }]} />;
}

function GenderToggle({ value, onChange, maleLabel, femaleLabel }: { value: 'M' | 'F'; onChange: (g: 'M' | 'F') => void; maleLabel: string; femaleLabel: string }) {
  return (
    <View style={s.genderRow}>
      <TouchableOpacity style={[s.genderBtn, value === 'M' && s.genderBtnMaleActive]} onPress={() => onChange('M')}>
        <Text style={[s.genderBtnText, value === 'M' && { color: Colors.brand.neonBlue }]}>♂  {maleLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.genderBtn, value === 'F' && s.genderBtnFemaleActive]} onPress={() => onChange('F')}>
        <Text style={[s.genderBtnText, value === 'F' && { color: Colors.brand.neonPink }]}>♀  {femaleLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const { setPlayerNames, setPlayerGenders, language, setLanguage, player1Name: sn1, player2Name: sn2, player1Gender: sg1, player2Gender: sg2 } = useGameStore();
  const t = (k: string) => tr(language, k);

  const [name1, setName1] = useState(sn1 || '');
  const [name2, setName2] = useState(sn2 || '');
  const [gender1, setGender1] = useState<'M' | 'F'>(sg1 || 'M');
  const [gender2, setGender2] = useState<'M' | 'F'>(sg2 || 'F');

  const flameScale = useRef(new Animated.Value(1)).current;
  const flameRotate = useRef(new Animated.Value(0)).current;
  const vsPulse = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(flameScale, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(flameRotate, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(flameScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(flameRotate, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(vsPulse, { toValue: 1.07, duration: 1000, useNativeDriver: true }),
      Animated.timing(vsPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 400, duration: 1800, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(shimmer, { toValue: -300, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);

  const flameRotateStr = flameRotate.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] });
  const valid = name1.trim().length > 0 && name2.trim().length > 0;

  const handleStart = () => {
    Sounds.playClick();
    setPlayerNames(name1.trim(), name2.trim());
    setPlayerGenders(gender1, gender2);
    router.push('/level-select');
  };

  return (
    <GradientBackground colors={Colors.gradient.splash}>
      {/* Ambient orbs */}
      <View style={[s.orb, { width: 280, height: 280, backgroundColor: 'rgba(255,78,0,0.10)', top: -80, left: -60 }]} />
      <View style={[s.orb, { width: 200, height: 200, backgroundColor: 'rgba(0,212,255,0.07)', bottom: 80, right: -40 }]} />
      <View style={[s.orb, { width: 160, height: 160, backgroundColor: 'rgba(255,45,120,0.07)', bottom: 140, left: -30 }]} />

      <ParticleBackground />

      <KeyboardAvoidingView style={s.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Top bar: language + settings */}
        <View style={s.topBar}>
          <View style={s.langPill}>
            {(['en', 'he'] as const).map(lang => (
              <TouchableOpacity key={lang} style={[s.langOpt, language === lang && s.langOptActive]} onPress={() => setLanguage(lang)}>
                <Text style={s.langFlag}>{lang === 'en' ? '🇺🇸' : '🇮🇱'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.settingsBtn} onPress={() => router.push('/settings')}>
            <Text style={s.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={s.logoArea}>
          <Animated.Text style={[s.flame, { transform: [{ scale: flameScale }, { rotate: flameRotateStr }] }]}>🔥</Animated.Text>
          <Text style={[s.logoText, { fontFamily: 'BebasNeue_400Regular' }]}>IGNITE</Text>
          <Text style={[s.tagline, { fontFamily: 'Exo2_700Bold' }]}>{t('tagline')}</Text>
        </View>

        {/* Divider */}
        <LinearGradient colors={['transparent', 'rgba(255,78,0,0.45)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.divider} />

        {/* Player 1 */}
        <View style={[s.playerCard, s.playerCard1]}>
          <View style={s.playerLabel}>
            <BlinkDot color={Colors.brand.neonBlue} />
            <Text style={[s.playerLabelText, { color: Colors.brand.neonBlue, fontFamily: 'Exo2_700Bold' }]}>{t('player1')}</Text>
          </View>
          <TextInput
            style={[s.nameInput, { fontFamily: 'Exo2_700Bold' }]}
            placeholder={t('namePlaceholder1')}
            placeholderTextColor={Colors.text.muted}
            value={name1}
            onChangeText={v => setName1(v.slice(0, 20))}
            autoCorrect={false}
          />
          <GenderToggle value={gender1} onChange={setGender1} maleLabel={t('male')} femaleLabel={t('female')} />
        </View>

        {/* VS divider */}
        <View style={s.vsDivider}>
          <LinearGradient colors={['transparent', 'rgba(255,215,0,0.3)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.vsLine} />
          <Animated.View style={{ transform: [{ scale: vsPulse }] }}>
            <LinearGradient colors={[Colors.brand.fire2, Colors.brand.fire]} style={s.vsBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[s.vsBadgeText, { fontFamily: 'BebasNeue_400Regular' }]}>VS</Text>
            </LinearGradient>
          </Animated.View>
          <LinearGradient colors={['rgba(255,215,0,0.3)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.vsLine} />
        </View>

        {/* Player 2 */}
        <View style={[s.playerCard, s.playerCard2]}>
          <View style={s.playerLabel}>
            <BlinkDot color={Colors.brand.neonPink} />
            <Text style={[s.playerLabelText, { color: Colors.brand.neonPink, fontFamily: 'Exo2_700Bold' }]}>{t('player2')}</Text>
          </View>
          <TextInput
            style={[s.nameInput, { fontFamily: 'Exo2_700Bold' }]}
            placeholder={t('namePlaceholder2')}
            placeholderTextColor={Colors.text.muted}
            value={name2}
            onChangeText={v => setName2(v.slice(0, 20))}
            autoCorrect={false}
          />
          <GenderToggle value={gender2} onChange={setGender2} maleLabel={t('male')} femaleLabel={t('female')} />
        </View>

        {/* Start */}
        <TouchableOpacity onPress={handleStart} disabled={!valid} style={[s.startWrap, !valid && { opacity: 0.4 }]} activeOpacity={0.85}>
          <LinearGradient colors={['#FF8C00', '#FF4E00', '#E63000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.startBtn}>
            <Animated.View style={[s.shimmer, { transform: [{ translateX: shimmer }, { skewX: '-20deg' }] }]} />
            <Text style={[s.startBtnText, { fontFamily: 'BebasNeue_400Regular' }]}>{t('startGame')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[s.bottomHint, { fontFamily: 'Exo2_700Bold' }]}>🎮  2 Players · Couple Mode</Text>

      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  kav: { flex: 1, paddingHorizontal: 24, paddingTop: 52, paddingBottom: 16, gap: 10 },
  orb: { position: 'absolute', borderRadius: 999 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  langPill: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  langOpt: { paddingVertical: 8, paddingHorizontal: 14 },
  langOptActive: { backgroundColor: 'rgba(255,78,0,0.28)' },
  langFlag: { fontSize: 18 },
  settingsBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 18 },

  logoArea: { alignItems: 'center', marginTop: 4 },
  flame: { fontSize: 48, lineHeight: 56 },
  logoText: { fontSize: 66, letterSpacing: 8, color: '#FF8C00', lineHeight: 70 },
  tagline: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: Colors.text.muted, marginTop: 2 },
  divider: { height: 1, width: '100%', marginVertical: 4 },

  playerCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16, gap: 10 },
  playerCard1: { borderLeftWidth: 3, borderLeftColor: Colors.brand.neonBlue },
  playerCard2: { borderLeftWidth: 3, borderLeftColor: Colors.brand.neonPink },
  playerLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerLabelText: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' },
  dot: { width: 7, height: 7, borderRadius: 4, shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  nameInput: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 12, paddingHorizontal: 16, color: Colors.text.primary, fontSize: 16, letterSpacing: 1 },

  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  genderBtnMaleActive: { borderColor: Colors.brand.neonBlue, backgroundColor: 'rgba(0,212,255,0.12)' },
  genderBtnFemaleActive: { borderColor: Colors.brand.neonPink, backgroundColor: 'rgba(255,45,120,0.12)' },
  genderBtnText: { color: Colors.text.muted, fontWeight: '700', fontSize: 13, letterSpacing: 1 },

  vsDivider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vsLine: { flex: 1, height: 1 },
  vsBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vsBadgeText: { fontSize: 17, color: '#fff', letterSpacing: 2 },

  startWrap: { borderRadius: 18, overflow: 'hidden', marginTop: 4 },
  startBtn: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 18, overflow: 'hidden' },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 70, backgroundColor: 'rgba(255,255,255,0.18)' },
  startBtnText: { fontSize: 28, letterSpacing: 5, color: '#fff' },

  bottomHint: { textAlign: 'center', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: Colors.text.muted },
});

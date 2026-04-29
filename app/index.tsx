import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

function GenderToggle({ value, onChange, maleLabel, femaleLabel }: { value: 'M'|'F'; onChange: (g:'M'|'F')=>void; maleLabel: string; femaleLabel: string }) {
  return (
    <View style={g.row}>
      <TouchableOpacity style={[g.btn, value==='M' && g.btnM]} onPress={() => onChange('M')}>
        <Text style={[g.txt, value==='M' && g.txtM]}>♂ {maleLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[g.btn, value==='F' && g.btnF]} onPress={() => onChange('F')}>
        <Text style={[g.txt, value==='F' && g.txtF]}>♀ {femaleLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const g = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, width: '100%' },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  btnM: { borderColor: Colors.brand.purpleLight, backgroundColor: 'rgba(168,85,247,0.15)' },
  btnF: { borderColor: Colors.brand.pink, backgroundColor: 'rgba(224,64,160,0.15)' },
  txt: { color: Colors.text.muted, fontWeight: '700', fontSize: 13 },
  txtM: { color: Colors.brand.purpleLight },
  txtF: { color: Colors.brand.pink },
});

export default function HomeScreen() {
  const { setPlayerNames, setPlayerGenders, language } = useGameStore();
  const t = (k: string) => tr(language, k);
  const isRtl = language === 'he';

  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [gender1, setGender1] = useState<'M'|'F'>('M');
  const [gender2, setGender2] = useState<'M'|'F'>('F');

  const titleGlow = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(titleGlow, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(titleGlow, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
    ])).start();
  }, []);

  const valid = name1.trim().length > 0 && name2.trim().length > 0;
  const handleStart = () => {
    setPlayerNames(name1.trim(), name2.trim());
    setPlayerGenders(gender1, gender2);
    router.push('/level-select');
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text style={styles.flame}>🔥</Text>
          <Animated.Text style={[styles.title, { opacity: titleGlow }]}>IGNITE</Animated.Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </View>
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, isRtl && styles.rtl]}>{t('player1')}</Text>
          <TextInput style={[styles.input, isRtl && styles.rtlInput]} placeholder={t('namePlaceholder1')} placeholderTextColor={Colors.text.muted} value={name1} onChangeText={(v) => setName1(v.slice(0,20))} autoCorrect={false} />
          <GenderToggle value={gender1} onChange={setGender1} maleLabel={t('male')} femaleLabel={t('female')} />
          <Text style={styles.heart}>♥</Text>
          <Text style={[styles.inputLabel, isRtl && styles.rtl]}>{t('player2')}</Text>
          <TextInput style={[styles.input, isRtl && styles.rtlInput]} placeholder={t('namePlaceholder2')} placeholderTextColor={Colors.text.muted} value={name2} onChangeText={(v) => setName2(v.slice(0,20))} autoCorrect={false} />
          <GenderToggle value={gender2} onChange={setGender2} maleLabel={t('male')} femaleLabel={t('female')} />
        </View>
        <GlowButton label={t('startGame')} onPress={handleStart} disabled={!valid} style={styles.cta} fontSize={20} />
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 28 },
  settingsBtn: { position: 'absolute', top: 52, right: 24, padding: 8 },
  settingsIcon: { fontSize: 24 },
  titleSection: { alignItems: 'center', gap: 6 },
  flame: { fontSize: 56 },
  title: { fontSize: 52, fontWeight: '900', color: Colors.brand.gold, letterSpacing: 10 },
  tagline: { color: Colors.text.secondary, fontSize: 16, fontStyle: 'italic' },
  inputSection: { gap: 8, alignItems: 'center' },
  inputLabel: { alignSelf: 'flex-start', color: Colors.text.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  input: { width: '100%', backgroundColor: Colors.bg.surface, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, color: Colors.text.primary, fontSize: 16, borderWidth: 1, borderColor: Colors.brand.purpleLight + '40' },
  rtl: { alignSelf: 'flex-end', textAlign: 'right' },
  rtlInput: { textAlign: 'right' },
  heart: { color: Colors.brand.pink, fontSize: 24, marginVertical: 2 },
  cta: { width: '100%' },
});

import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

export default function HomeScreen() {
  const { setPlayerNames, language, player1Name, player2Name } = useGameStore();
  const t = (key: string) => tr(language, key);
  const isRtl = language === 'he';

  const [name1, setName1] = React.useState(player1Name);
  const [name2, setName2] = React.useState(player2Name);

  const titleGlow = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleGlow, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(titleGlow, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const valid = name1.trim().length > 0 && name2.trim().length > 0;

  const handleStart = () => {
    setPlayerNames(name1.trim(), name2.trim());
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
          <TextInput
            style={[styles.input, isRtl && styles.rtlInput]}
            placeholder={t('namePlaceholder1')}
            placeholderTextColor={Colors.text.muted}
            value={name1}
            onChangeText={(t) => setName1(t.slice(0, 20))}
            autoCorrect={false}
          />
          <Text style={styles.heart}>♥</Text>
          <Text style={[styles.inputLabel, isRtl && styles.rtl]}>{t('player2')}</Text>
          <TextInput
            style={[styles.input, isRtl && styles.rtlInput]}
            placeholder={t('namePlaceholder2')}
            placeholderTextColor={Colors.text.muted}
            value={name2}
            onChangeText={(t) => setName2(t.slice(0, 20))}
            autoCorrect={false}
          />
        </View>

        <GlowButton label={t('startGame')} onPress={handleStart} disabled={!valid} style={styles.cta} fontSize={20} />
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 32 },
  settingsBtn: { position: 'absolute', top: 52, right: 24, padding: 8 },
  settingsIcon: { fontSize: 24 },
  titleSection: { alignItems: 'center', gap: 6 },
  flame: { fontSize: 56 },
  title: { fontSize: 52, fontWeight: '900', color: Colors.brand.gold, letterSpacing: 10 },
  tagline: { color: Colors.text.secondary, fontSize: 16, fontStyle: 'italic' },
  inputSection: { gap: 10, alignItems: 'center' },
  inputLabel: { alignSelf: 'flex-start', color: Colors.text.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  input: { width: '100%', backgroundColor: Colors.bg.surface, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, color: Colors.text.primary, fontSize: 16, borderWidth: 1, borderColor: Colors.brand.purpleLight + '40' },
  rtl: { alignSelf: 'flex-end', textAlign: 'right' },
  rtlInput: { textAlign: 'right' },
  heart: { color: Colors.brand.pink, fontSize: 24, marginVertical: 4 },
  cta: { width: '100%' },
});

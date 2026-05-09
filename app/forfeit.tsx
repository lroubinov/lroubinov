import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GradientBackground from '../src/components/ui/GradientBackground';
import ParticleBackground from '../src/components/ui/ParticleBackground';
import { Colors } from '../src/constants/colors';
import { heTexts } from '../src/data/he';
import { tr } from '../src/i18n';
import { resolveText } from '../src/utils/resolveText';
import { Sounds } from '../src/utils/sounds';
import { useGameStore } from '../src/store/gameStore';

export default function ForfeitScreen() {
  const { gameState, completeForfeit, language } = useGameStore();
  const t = (k: string) => tr(language, k);
  const isRtl = language === 'he';

  // Animations
  const cardScale   = useRef(new Animated.Value(0.7)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide  = useRef(new Animated.Value(-30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const btnScale    = useRef(new Animated.Value(0.85)).current;
  const pulse       = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Sounds.playForfeit();
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(titleSlide,   { toValue: 0,  duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardScale,   { toValue: 1, damping: 11, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.spring(btnScale, { toValue: 1, damping: 10, useNativeDriver: true }),
    ]).start(() => {
      // Pulse the accept button
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])).start();
    });
  }, []);

  if (!gameState?.pendingForfeit) { router.back(); return null; }

  const currentPlayer = gameState.config.players[gameState.currentPlayerIndex];
  const partnerIndex: 0 | 1  = gameState.currentPlayerIndex === 0 ? 1 : 0;
  const partnerGender         = gameState.config.players[partnerIndex].gender;
  const forfeit               = gameState.pendingForfeit;
  const rawText = language === 'he' ? (heTexts[forfeit.id] ?? forfeit.text) : forfeit.text;
  const displayText = resolveText(rawText, currentPlayer.gender, partnerGender);

  const handleAccept = () => {
    Sounds.playDone();
    completeForfeit();
    router.back();
  };

  return (
    <GradientBackground colors={['#1A0005', '#0A000E', '#060410']}>
      <ParticleBackground particles={[
        { color: Colors.brand.crimson, size: 3, left: 20, duration: 9000, delay: 0 },
        { color: Colors.brand.fire,    size: 2, left: 50, duration: 7000, delay: 2000 },
        { color: Colors.brand.crimson, size: 2, left: 80, duration: 8000, delay: 1000 },
      ]} />

      <View style={s.container}>

        {/* Header */}
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }], alignItems: 'center', gap: 6 }}>
          <Text style={[s.header, { fontFamily: 'BebasNeue_400Regular' }]}>{t('forfeitTime')}</Text>
          <View style={s.playerChip}>
            <LinearGradient colors={[Colors.brand.crimson + '40', Colors.brand.fire + '20']} style={s.playerChipGrad}>
              <Text style={[s.consequence, { fontFamily: 'Exo2_700Bold' }]}>{t('consequence')}</Text>
              <Text style={[s.playerName, { fontFamily: 'BebasNeue_400Regular' }]}>{currentPlayer.name}</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Forfeit card */}
        <Animated.View style={[s.cardWrap, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
          <LinearGradient colors={['rgba(232,64,64,0.15)', 'rgba(232,64,64,0.05)']} style={s.card}>
            {/* Left strip */}
            <View style={s.strip} />
            {/* Glass shine */}
            <View style={s.shine} />
            <Text style={s.icon}>⚡</Text>
            <Text style={[s.cardText, isRtl && s.rtl]}>{displayText}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Accept button */}
        <Animated.View style={{ transform: [{ scale: Animated.multiply(btnScale, pulse) }], width: '100%' }}>
          <TouchableOpacity onPress={handleAccept} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.brand.crimson, '#8B0000']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.acceptBtn}
            >
              <View style={s.acceptShine} />
              <Text style={[s.acceptText, { fontFamily: 'BebasNeue_400Regular' }]}>{t('iAccept')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 28, paddingTop: 60, justifyContent: 'center', gap: 28, alignItems: 'center' },

  header: { color: Colors.brand.crimson, fontSize: 52, letterSpacing: 3, textAlign: 'center', lineHeight: 56,
    textShadowColor: Colors.brand.crimson, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  playerChip: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: Colors.brand.crimson + '40' },
  playerChipGrad: { paddingVertical: 10, paddingHorizontal: 24, alignItems: 'center', gap: 2 },
  consequence: { color: Colors.text.muted, fontSize: 11, letterSpacing: 2 },
  playerName: { color: Colors.brand.gold, fontSize: 28, letterSpacing: 2 },

  cardWrap: { width: '100%' },
  card: {
    borderRadius: 22, padding: 28, alignItems: 'center', gap: 16,
    borderWidth: 1.5, borderColor: Colors.brand.crimson + '70',
    overflow: 'hidden', position: 'relative',
    shadowColor: Colors.brand.crimson, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
  },
  strip: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, backgroundColor: Colors.brand.crimson, opacity: 0.85 },
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: '35%', backgroundColor: 'rgba(255,255,255,0.05)', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  icon: { fontSize: 44 },
  cardText: { color: Colors.text.primary, fontSize: 19, lineHeight: 30, textAlign: 'center', fontWeight: '500' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },

  acceptBtn: {
    paddingVertical: 20, borderRadius: 22, alignItems: 'center', overflow: 'hidden',
    shadowColor: Colors.brand.crimson, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  acceptShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(255,255,255,0.12)', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  acceptText: { color: '#fff', fontSize: 30, letterSpacing: 4 },
});

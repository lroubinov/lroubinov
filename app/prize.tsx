import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import GradientBackground from '../src/components/ui/GradientBackground';
import ParticleBackground from '../src/components/ui/ParticleBackground';
import PrizeWheel from '../src/components/ui/PrizeWheel';
import { Colors } from '../src/constants/colors';
import { defaultPrizes } from '../src/data/prizes';
import { tr } from '../src/i18n';
import { Sounds } from '../src/utils/sounds';
import { useGameStore } from '../src/store/gameStore';

export default function PrizeScreen() {
  const { gameState, language, customPrizes } = useGameStore();
  const t = (k: string) => tr(language, k);
  const isRtl = language === 'he';

  const [wonPrize, setWonPrize] = useState<string | null>(null);

  if (!gameState) { router.replace('/'); return null; }

  const [p1, p2] = gameState.config.players;
  const isDraw   = p1.score === p2.score;
  const winner   = isDraw ? null : p1.score > p2.score ? p1 : p2;

  const allPrizes  = customPrizes.length > 0 ? customPrizes : defaultPrizes;
  const langPrizes = allPrizes.filter(p => p.lang === language);
  const individual    = langPrizes.filter(p => !p.collaborative).map(p => p.text);
  const collaborative = langPrizes.filter(p => p.collaborative).map(p => p.text);
  const wheelPrizes   = isDraw ? collaborative : individual;

  const handleComplete = (prize: string) => {
    Sounds.playDing();
    setWonPrize(prize);
  };

  return (
    <GradientBackground colors={Colors.gradient.splash}>
      <ParticleBackground />
      <SafeAreaView style={s.safe}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={[s.back, isRtl && s.backRtl]}>
          <Text style={s.backText}>{isRtl ? 'תוצאות →' : '← Results'}</Text>
        </TouchableOpacity>

        {/* Who's spinning */}
        <View style={s.header}>
          <Text style={s.arrowDown}>▼</Text>
          <Text style={[s.spinFor, { fontFamily: 'Exo2_700Bold' }]}>
            {isDraw ? t('spinCollaborative') : t('spinForPrize')}
          </Text>
          {!isDraw && winner && (
            <Text style={[s.winnerName, { fontFamily: 'BebasNeue_400Regular' }]}>{winner.name}</Text>
          )}
        </View>

        {/* Wheel or Prize result */}
        <View style={s.centerContent}>
          {wonPrize ? (
            <View style={s.resultWrap}>
              <LinearGradient
                colors={['rgba(255,79,163,0.15)', 'rgba(107,0,128,0.10)']}
                style={s.resultCard}
              >
                <View style={[s.resultBorder, { borderColor: Colors.brand.neonPink + '50' }]} />
                <Text style={s.prizeEmoji}>🎁</Text>
                <Text style={[s.prizeLabel, { fontFamily: 'Exo2_700Bold' }]}>
                  {isDraw ? t('collaborativePrize') : t('yourPrize')}
                </Text>
                <Text style={[s.prizeText, { fontFamily: 'BebasNeue_400Regular' }]}>{wonPrize}</Text>
              </LinearGradient>

              <TouchableOpacity onPress={() => setWonPrize(null)} style={s.spinAgainBtn} activeOpacity={0.85}>
                <LinearGradient
                  colors={['rgba(232,37,106,0.18)', 'rgba(107,0,128,0.12)']}
                  style={s.spinAgainInner}
                >
                  <Text style={[s.spinAgainText, { fontFamily: 'Exo2_700Bold' }]}>{t('spinAgain')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <PrizeWheel
              prizes={wheelPrizes}
              spinLabel={t('spinBtn')}
              onComplete={handleComplete}
              radius={150}
            />
          )}
        </View>

      </SafeAreaView>
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  back: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backRtl: { alignItems: 'flex-end' },
  backText: { color: Colors.text.muted, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

  header: { alignItems: 'center', paddingTop: 8, gap: 4, paddingBottom: 12 },
  arrowDown: { color: Colors.brand.gold, fontSize: 22, textShadowColor: Colors.brand.gold, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  spinFor: { color: Colors.brand.gold, fontSize: 17, letterSpacing: 1, textAlign: 'center', paddingHorizontal: 20 },
  winnerName: { color: Colors.brand.neonPink, fontSize: 36, letterSpacing: 2, lineHeight: 40 },

  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },

  resultWrap: { alignItems: 'center', gap: 20, paddingHorizontal: 24, width: '100%' },
  resultCard: {
    width: '100%', borderRadius: 26, padding: 32,
    alignItems: 'center', gap: 10, overflow: 'hidden', position: 'relative',
  },
  resultBorder: { position: 'absolute', inset: 0, borderRadius: 26, borderWidth: 1.5 } as any,
  prizeEmoji: { fontSize: 56 },
  prizeLabel: { color: Colors.text.muted, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
  prizeText: { color: Colors.brand.gold, fontSize: 28, letterSpacing: 2, lineHeight: 34, textAlign: 'center' },

  spinAgainBtn: { borderRadius: 22, overflow: 'hidden', width: '70%' },
  spinAgainInner: {
    paddingVertical: 16, alignItems: 'center', borderRadius: 22,
    borderWidth: 1.5, borderColor: Colors.brand.neonPink + '50',
  },
  spinAgainText: { color: Colors.brand.neonPink, fontSize: 16, letterSpacing: 1 },
});

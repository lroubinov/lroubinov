import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  SafeAreaView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import GradientBackground from '../src/components/ui/GradientBackground';
import ParticleBackground from '../src/components/ui/ParticleBackground';
import PrizeWheel, { PrizeWheelRef } from '../src/components/ui/PrizeWheel';
import { Colors } from '../src/constants/colors';
import { defaultPrizes } from '../src/data/prizes';
import { tr } from '../src/i18n';
import { Sounds } from '../src/utils/sounds';
import { useGameStore } from '../src/store/gameStore';

export default function PrizeScreen() {
  const { gameState, language, customPrizes, startGame, resetGame } = useGameStore();
  const t = (k: string) => tr(language, k);
  const isRtl = language === 'he';

  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef<PrizeWheelRef>(null);

  if (!gameState) { router.replace('/'); return null; }

  const [p1, p2] = gameState.config.players;
  const isDraw   = p1.score === p2.score;
  const winner   = isDraw ? null : p1.score > p2.score ? p1 : p2;

  const allPrizes  = customPrizes.length > 0 ? customPrizes : defaultPrizes;
  const langPrizes = allPrizes.filter(p => p.lang === language);
  const individual    = langPrizes.filter(p => !p.collaborative).map(p => p.text);
  const collaborative = langPrizes.filter(p => p.collaborative).map(p => p.text);
  const wheelPrizes   = isDraw ? collaborative : individual;

  const handleSpin = () => { wheelRef.current?.spin(); };

  const handleComplete = (prize: string) => {
    Sounds.playDing();
    setWonPrize(prize);
    setSpinning(false);
  };

  const handlePlayAgain = () => {
    Sounds.playClick();
    startGame();
    router.replace('/game');
  };

  const handleNewGame = () => {
    Sounds.playClick();
    resetGame();
    router.replace('/');
  };

  return (
    <GradientBackground>
      <ParticleBackground />
      <SafeAreaView style={s.safe}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={[s.back, isRtl && s.backRtl]}>
          <Text style={s.backText}>{isRtl ? 'תוצאות →' : '← Results'}</Text>
        </TouchableOpacity>

        {/* Who's spinning */}
        <View style={s.header}>
          <Text style={[s.spinFor, { fontFamily: 'Exo2_700Bold' }]}>
            {isDraw ? t('spinCollaborative') : t('spinForPrize')}
          </Text>
          {!isDraw && winner && (
            <Text style={[s.winnerName, { fontFamily: 'BebasNeue_400Regular' }]}>{winner.name}</Text>
          )}
        </View>

        {wonPrize ? (
          /* ── Prize revealed ── */
          <View style={s.resultOuter}>
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

            {/* Spin Again */}
            <TouchableOpacity onPress={() => setWonPrize(null)} style={s.spinAgainBtn} activeOpacity={0.85}>
              <LinearGradient colors={['rgba(232,37,106,0.18)', 'rgba(107,0,128,0.12)']} style={s.spinAgainInner}>
                <Text style={[s.spinAgainText, { fontFamily: 'Exo2_700Bold' }]}>{t('spinAgain')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Play Again */}
            <TouchableOpacity onPress={handlePlayAgain} style={s.playAgainBtn} activeOpacity={0.85}>
              <LinearGradient colors={['#FF8500', '#FF4500', '#D42800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.playAgainGrad}>
                <Text style={[s.playAgainText, { fontFamily: 'BebasNeue_400Regular' }]}>{t('playAgain')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* New Game */}
            <TouchableOpacity onPress={handleNewGame} style={s.newGameBtn} activeOpacity={0.85}>
              <Text style={[s.newGameText, { fontFamily: 'Exo2_700Bold' }]}>{t('newGame')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Wheel + SPIN button ── */
          <View style={s.wheelOuter}>
            {/* SPIN button rendered FIRST — appears immediately before SVG loads */}
            <TouchableOpacity
              onPress={handleSpin}
              disabled={spinning}
              activeOpacity={0.85}
              style={s.spinWrap}
            >
              <LinearGradient
                colors={spinning ? ['#444', '#333'] : ['#FF8500', '#E63000']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.spinBtn}
              >
                <Text style={[s.spinText, { fontFamily: 'BebasNeue_400Regular' }]}>{t('spinBtn')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={s.arrowDown}>▼</Text>

            {/* Wheel SVG (renders after button) */}
            <PrizeWheel
              ref={wheelRef}
              prizes={wheelPrizes}
              onComplete={handleComplete}
              onSpinStart={() => setSpinning(true)}
              radius={140}
            />
          </View>
        )}

      </SafeAreaView>
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  back: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backRtl: { alignItems: 'flex-end' },
  backText: { color: Colors.text.muted, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

  header: { alignItems: 'center', paddingTop: 4, paddingBottom: 8, gap: 2 },
  spinFor: { color: Colors.brand.gold, fontSize: 16, letterSpacing: 1, textAlign: 'center', paddingHorizontal: 20 },
  winnerName: { color: Colors.brand.neonPink, fontSize: 34, letterSpacing: 2, lineHeight: 38 },

  // Wheel layout
  wheelOuter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 16 },
  spinWrap: { borderRadius: 22, overflow: 'hidden', width: 180 },
  spinBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 22 },
  spinText: { color: '#fff', fontSize: 28, letterSpacing: 4 },
  arrowDown: { color: Colors.brand.gold, fontSize: 20, textShadowColor: Colors.brand.gold, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },

  // Prize result
  resultOuter: { flex: 1, alignItems: 'center', gap: 14, paddingHorizontal: 24, paddingBottom: 20, justifyContent: 'center' },
  resultCard: {
    width: '100%', borderRadius: 26, padding: 28,
    alignItems: 'center', gap: 10, overflow: 'hidden', position: 'relative',
  },
  resultBorder: { position: 'absolute', inset: 0, borderRadius: 26, borderWidth: 1.5 } as any,
  prizeEmoji: { fontSize: 52 },
  prizeLabel: { color: Colors.text.muted, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
  prizeText: { color: Colors.brand.gold, fontSize: 26, letterSpacing: 2, lineHeight: 32, textAlign: 'center' },

  spinAgainBtn: { borderRadius: 22, overflow: 'hidden', width: '80%' },
  spinAgainInner: {
    paddingVertical: 14, alignItems: 'center', borderRadius: 22,
    borderWidth: 1.5, borderColor: Colors.brand.neonPink + '50',
  },
  spinAgainText: { color: Colors.brand.neonPink, fontSize: 15, letterSpacing: 1 },

  playAgainBtn: { borderRadius: 20, overflow: 'hidden', width: '100%' },
  playAgainGrad: { paddingVertical: 18, alignItems: 'center' },
  playAgainText: { color: '#fff', fontSize: 26, letterSpacing: 3 },

  newGameBtn: {
    width: '100%', paddingVertical: 14, borderRadius: 20, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  newGameText: { color: Colors.text.muted, fontSize: 15 },
});

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import GradientBackground from '../src/components/ui/GradientBackground';
import ParticleBackground from '../src/components/ui/ParticleBackground';
import { Colors } from '../src/constants/colors';
import { HistoryEntry } from '../src/data/types';
import { tr } from '../src/i18n';
import { Sounds } from '../src/utils/sounds';
import { useGameStore } from '../src/store/gameStore';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  Colors.brand.neonPink, Colors.brand.gold, Colors.brand.neonBlue,
  '#7B2FBE', '#FF4500', '#3ECF4C', '#FF8500',
];

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'rect';
}

function Confetti() {
  const particles = useRef<Particle[]>(
    Array.from({ length: 50 }, (_, i) => {
      const fromLeft = i < 25;
      return {
        x:        new Animated.Value(fromLeft ? -30 : SW + 30),
        y:        new Animated.Value(-60 - Math.random() * 80),
        opacity:  new Animated.Value(1),
        rotation: new Animated.Value(0),
        color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size:     Math.random() * 9 + 6,
        shape:    (['square', 'circle', 'rect'] as const)[Math.floor(Math.random() * 3)],
      };
    })
  ).current;

  useEffect(() => {
    particles.forEach((p, i) => {
      const fromLeft = i < 25;
      const targetX  = fromLeft
        ? SW * (0.1 + Math.random() * 0.9)
        : SW * (Math.random() * 0.9);
      const delay = i * 40;

      Animated.parallel([
        Animated.timing(p.x, {
          toValue: targetX,
          duration: 1400 + Math.random() * 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.y, {
            toValue: Math.random() * SH * 0.55 + 80,
            duration: 1000 + Math.random() * 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: SH + 60,
            duration: 700 + Math.random() * 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 2400 + Math.random() * 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotation, {
          toValue: 4,
          duration: 2200 + Math.random() * 600,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rotation.interpolate({ inputRange: [0, 4], outputRange: ['0deg', '1440deg'] });
        const isRect = p.shape === 'rect';
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width:  isRect ? p.size * 1.8 : p.size,
              height: p.size,
              borderRadius: p.shape === 'circle' ? p.size / 2 : 2,
              backgroundColor: p.color,
              transform: [{ translateX: p.x }, { translateY: p.y }, { rotate }],
              opacity: p.opacity,
            }}
          />
        );
      })}
    </View>
  );
}

// ─── History row ──────────────────────────────────────────────────────────────

const RESULT_ICON: Record<HistoryEntry['result'], string> = { done: '✓', skipped: '→', forfeit: '⚡' };
const RESULT_COLOR: Record<HistoryEntry['result'], string> = {
  done:    '#6FCF4A',
  skipped: Colors.brand.gold,
  forfeit: Colors.brand.crimson,
};
const TYPE_EMOJI: Record<string, string> = { truth: '💬', dare: '🔥' };

function HistoryRow({ entry, t }: { entry: HistoryEntry; t: (k: string) => string }) {
  const label = entry.result === 'done' ? t('historyDone') : entry.result === 'skipped' ? t('historySkipped') : t('historyForfeit');
  const color = RESULT_COLOR[entry.result];
  return (
    <View style={h.row}>
      <Text style={h.turn}>{entry.turn}</Text>
      <Text style={h.typeEmoji}>{TYPE_EMOJI[entry.cardType]}</Text>
      <View style={h.content}>
        <Text style={h.player}>{entry.playerName}</Text>
        <Text style={h.cardText} numberOfLines={1}>{entry.cardText}</Text>
      </View>
      <View style={[h.badge, { borderColor: color + '60', backgroundColor: color + '15' }]}>
        <Text style={[h.badgeText, { color }]}>{RESULT_ICON[entry.result]} {label}</Text>
      </View>
    </View>
  );
}

const h = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  turn: { color: Colors.text.muted, fontSize: 11, fontWeight: '700', minWidth: 18, textAlign: 'center' },
  typeEmoji: { fontSize: 16 },
  content: { flex: 1, gap: 2 },
  player: { color: Colors.text.secondary, fontSize: 12, fontWeight: '700' },
  cardText: { color: Colors.text.muted, fontSize: 11, lineHeight: 15 },
  badge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});

// ─── Results screen ───────────────────────────────────────────────────────────

export default function ResultsScreen() {
  const { gameState, resetGame, startGame, language, customPrizes } = useGameStore();
  const t = (key: string) => tr(language, key);

  const [showHistory, setShowHistory] = useState(false);

  const winnerScale   = useRef(new Animated.Value(0.55)).current;
  const winnerOpacity = useRef(new Animated.Value(0)).current;
  const crownBounce   = useRef(new Animated.Value(-20)).current;
  const p1Scale = useRef(new Animated.Value(0.75)).current;
  const p2Scale = useRef(new Animated.Value(0.75)).current;
  const btnScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Sounds.playWin();
    setTimeout(() => Sounds.playConfetti(), 600);
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(winnerScale,   { toValue: 1, damping: 9, stiffness: 80, useNativeDriver: true }),
        Animated.timing(winnerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(crownBounce,   { toValue: 0, damping: 7, stiffness: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(p1Scale, { toValue: 1, damping: 11, useNativeDriver: true }),
        Animated.spring(p2Scale, { toValue: 1, damping: 11, delay: 80, useNativeDriver: true } as any),
      ]),
      Animated.spring(btnScale, { toValue: 1, damping: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!gameState) { router.replace('/'); return null; }

  const [p1, p2] = gameState.config.players;
  const isDraw   = p1.score === p2.score;
  const winner   = isDraw ? null : p1.score > p2.score ? p1 : p2;
  const history  = gameState.history ?? [];

  const handlePlayAgain = () => { Sounds.playClick(); startGame(); router.replace('/game'); };
  const handleNewGame   = () => { Sounds.playClick(); resetGame(); router.replace('/'); };
  const handlePrize     = () => { Sounds.playClick(); router.push('/prize' as any); };

  return (
    <GradientBackground colors={Colors.gradient.splash}>
      <ParticleBackground />
      <Confetti />

      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <Text style={[s.title, { fontFamily: 'BebasNeue_400Regular' }]}>{t('gameOver')}</Text>

        {/* Winner card */}
        <Animated.View style={[s.winnerWrap, { opacity: winnerOpacity, transform: [{ scale: winnerScale }] }]}>
          <LinearGradient
            colors={isDraw
              ? ['rgba(255,79,163,0.18)', 'rgba(61,214,245,0.10)']
              : ['rgba(255,213,96,0.18)', 'rgba(255,133,0,0.08)']}
            style={s.winnerCard}
          >
            <View style={[s.winnerBorder, { borderColor: isDraw ? Colors.brand.neonPink + '55' : Colors.brand.gold + '65' }]} />
            <View style={s.winnerShine} />

            {isDraw ? (
              <>
                <Text style={s.bigEmoji}>💋</Text>
                <Text style={[s.drawText, { fontFamily: 'BebasNeue_400Regular' }]}>{t('itsADraw')}</Text>
                <Text style={[s.drawSub, { fontFamily: 'Exo2_700Bold' }]}>{t('bothWin')}</Text>
              </>
            ) : (
              <>
                <Animated.Text style={[s.bigEmoji, { transform: [{ translateY: crownBounce }] }]}>👑</Animated.Text>
                <Text style={[s.winnerLabel, { fontFamily: 'Exo2_700Bold' }]}>{t('winner')}</Text>
                <Text style={[s.winnerName, { fontFamily: 'BebasNeue_400Regular' }]}>{winner!.name}</Text>
                <Text style={[s.winnerScore, { fontFamily: 'Exo2_700Bold' }]}>{winner!.score} {t('pts')}</Text>
              </>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Spark divider */}
        <LinearGradient
          colors={['transparent', Colors.brand.neonPink + '60', Colors.brand.gold + '80', Colors.brand.neonPink + '60', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.spark}
        />

        {/* Score comparison */}
        <View style={s.scoresRow}>
          <Animated.View style={[s.scoreCard, { borderColor: Colors.brand.neonBlue + '60', transform: [{ scale: p1Scale }] }]}>
            <Text style={[s.scoreName, { color: Colors.brand.neonBlue }]} numberOfLines={1}>{p1.name}</Text>
            <Text style={s.scorePts}>{p1.score}</Text>
            <Text style={s.scorePtsLabel}>{t('pts')}</Text>
            {p1.forfeitsOwed > 0 && <Text style={s.forfeitBadge}>⚡ {p1.forfeitsOwed} {p1.forfeitsOwed > 1 ? t('forfeits') : t('forfeit')}</Text>}
          </Animated.View>

          <View style={s.vsWrap}>
            <Text style={[s.vs, { fontFamily: 'BebasNeue_400Regular' }]}>VS</Text>
          </View>

          <Animated.View style={[s.scoreCard, { borderColor: Colors.brand.neonPink + '60', transform: [{ scale: p2Scale }] }]}>
            <Text style={[s.scoreName, { color: Colors.brand.neonPink }]} numberOfLines={1}>{p2.name}</Text>
            <Text style={s.scorePts}>{p2.score}</Text>
            <Text style={s.scorePtsLabel}>{t('pts')}</Text>
            {p2.forfeitsOwed > 0 && <Text style={s.forfeitBadge}>⚡ {p2.forfeitsOwed} {p2.forfeitsOwed > 1 ? t('forfeits') : t('forfeit')}</Text>}
          </Animated.View>
        </View>

        {/* Prize button */}
        <Animated.View style={[s.prizeWrap, { transform: [{ scale: btnScale }] }]}>
          <TouchableOpacity onPress={handlePrize} activeOpacity={0.88} style={s.prizeTouchable}>
            <LinearGradient
              colors={['#6B0080', '#A0009A', '#C2005A', '#E8256A']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.prizeBtn}
            >
              <View style={s.prizeBtnShine} />
              <Text style={s.prizeEmoji}>🎡</Text>
              <Text style={[s.prizeBtnText, { fontFamily: 'BebasNeue_400Regular' }]}>
                {isDraw ? t('getPrizeDraw') : t('getPrize')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Turn history */}
        {history.length > 0 && (
          <View style={s.historySection}>
            <TouchableOpacity style={s.historyHeader} onPress={() => setShowHistory(v => !v)}>
              <Text style={[s.historyTitle, { fontFamily: 'Exo2_700Bold' }]}>
                📜 {t('historyTitle')} ({history.length})
              </Text>
              <Text style={s.chevron}>{showHistory ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showHistory && (
              <View style={s.historyList}>
                {[...history].reverse().map((entry, i) => (
                  <HistoryRow key={i} entry={entry} t={t} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Action buttons */}
        <View style={s.buttons}>
          <TouchableOpacity onPress={handlePlayAgain} style={s.primaryBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#FF8500', '#FF4500', '#D42800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.primaryBtnGrad}>
              <Text style={[s.primaryBtnText, { fontFamily: 'BebasNeue_400Regular' }]}>{t('playAgain')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNewGame} style={s.secondaryBtn} activeOpacity={0.85}>
            <Text style={[s.secondaryBtnText, { fontFamily: 'Exo2_700Bold' }]}>{t('newGame')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  container: { padding: 24, paddingTop: 56, paddingBottom: 60, gap: 20, alignItems: 'center' },

  title: { color: Colors.brand.gold, fontSize: 52, letterSpacing: 4, textAlign: 'center', lineHeight: 56 },

  winnerWrap: { width: '100%' },
  winnerCard: {
    borderRadius: 26, padding: 32, alignItems: 'center', gap: 6,
    width: '100%', overflow: 'hidden', position: 'relative',
  },
  winnerBorder: { position: 'absolute', inset: 0, borderRadius: 26, borderWidth: 1.5 } as any,
  winnerShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
  },
  bigEmoji: { fontSize: 54 },
  winnerLabel: { color: Colors.text.muted, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
  winnerName: { color: Colors.brand.gold, fontSize: 44, letterSpacing: 3, lineHeight: 48, textAlign: 'center' },
  winnerScore: { color: Colors.text.secondary, fontSize: 16 },
  drawText: { color: Colors.brand.neonPink, fontSize: 40, letterSpacing: 2 },
  drawSub:  { color: Colors.text.secondary, fontSize: 14 },

  spark: { height: 1, width: '80%' },

  scoresRow: { flexDirection: 'row', gap: 12, width: '100%', alignItems: 'center' },
  scoreCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1.5, padding: 18, alignItems: 'center', gap: 4 },
  scoreName: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, maxWidth: 100, textAlign: 'center' },
  scorePts: { color: Colors.brand.gold, fontSize: 36, fontWeight: '900', lineHeight: 40 },
  scorePtsLabel: { color: Colors.text.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  forfeitBadge: { color: Colors.brand.crimson, fontSize: 11, fontWeight: '700', marginTop: 4 },
  vsWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  vs: { color: Colors.text.muted, fontSize: 16, letterSpacing: 1 },

  // Prize button
  prizeWrap: { width: '100%' },
  prizeTouchable: { borderRadius: 24, overflow: 'hidden' },
  prizeBtn: {
    paddingVertical: 22, borderRadius: 24, alignItems: 'center',
    overflow: 'hidden', position: 'relative', gap: 4,
  },
  prizeBtnShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  prizeEmoji: { fontSize: 32 },
  prizeBtnText: { color: '#fff', fontSize: 24, letterSpacing: 3 },

  historySection: { width: '100%', gap: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  historyTitle: { color: Colors.text.secondary, fontSize: 13, letterSpacing: 1 },
  chevron: { color: Colors.text.muted, fontSize: 12 },
  historyList: { gap: 6 },

  buttons: { width: '100%', gap: 12, marginTop: 4 },
  primaryBtn: { borderRadius: 20, overflow: 'hidden' },
  primaryBtnGrad: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 28, letterSpacing: 4 },
  secondaryBtn: { paddingVertical: 14, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  secondaryBtnText: { color: Colors.text.muted, fontSize: 15 },
});

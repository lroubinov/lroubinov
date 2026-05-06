import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GradientBackground from '../src/components/ui/GradientBackground';
import ParticleBackground from '../src/components/ui/ParticleBackground';
import PrizeWheel from '../src/components/ui/PrizeWheel';
import { Colors } from '../src/constants/colors';
import { defaultPrizes } from '../src/data/prizes';
import { HistoryEntry } from '../src/data/types';
import { tr } from '../src/i18n';
import { Sounds } from '../src/utils/sounds';
import { useGameStore } from '../src/store/gameStore';

const RESULT_ICON: Record<HistoryEntry['result'], string> = {
  done:    '✓',
  skipped: '→',
  forfeit: '⚡',
};
const RESULT_COLOR: Record<HistoryEntry['result'], string> = {
  done:    '#6FCF4A',
  skipped: Colors.brand.gold,
  forfeit: Colors.brand.crimson,
};
const TYPE_EMOJI: Record<string, string> = { truth: '💬', dare: '🔥' };

function HistoryRow({ entry, t }: { entry: HistoryEntry; t: (k: string) => string }) {
  const resultLabel = entry.result === 'done'
    ? t('historyDone') : entry.result === 'skipped'
    ? t('historySkipped') : t('historyForfeit');
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
        <Text style={[h.badgeText, { color }]}>{RESULT_ICON[entry.result]} {resultLabel}</Text>
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

export default function ResultsScreen() {
  const { gameState, resetGame, startGame, language, customPrizes } = useGameStore();
  const t = (key: string) => tr(language, key);

  const [showHistory, setShowHistory] = useState(false);
  const [wonPrize, setWonPrize]       = useState<string | null>(null);

  const winnerScale   = useRef(new Animated.Value(0.6)).current;
  const winnerOpacity = useRef(new Animated.Value(0)).current;
  const p1Scale = useRef(new Animated.Value(0.8)).current;
  const p2Scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(winnerScale,   { toValue: 1, damping: 10, useNativeDriver: true }),
        Animated.timing(winnerOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(p1Scale, { toValue: 1, damping: 12, useNativeDriver: true }),
        Animated.spring(p2Scale, { toValue: 1, damping: 12, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  if (!gameState) { router.replace('/'); return null; }

  const [p1, p2] = gameState.config.players;
  const isDraw   = p1.score === p2.score;
  const winner   = isDraw ? null : p1.score > p2.score ? p1 : p2;
  const history  = gameState.history ?? [];

  // Resolve prizes: use custom if any, else defaults
  const allPrizes = customPrizes.length > 0 ? customPrizes : defaultPrizes;
  const langPrizes = allPrizes.filter(p => p.lang === language);
  const individualPrizes    = langPrizes.filter(p => !p.collaborative).map(p => p.text);
  const collaborativePrizes = langPrizes.filter(p => p.collaborative).map(p => p.text);
  const wheelPrizes = isDraw ? collaborativePrizes : individualPrizes;

  const handlePlayAgain = () => { Sounds.playClick(); startGame(); router.replace('/game'); };
  const handleNewGame   = () => { Sounds.playClick(); resetGame(); router.replace('/'); };

  return (
    <GradientBackground colors={Colors.gradient.splash}>
      <ParticleBackground />
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <Text style={[s.title, { fontFamily: 'BebasNeue_400Regular' }]}>{t('gameOver')}</Text>

        {/* Winner card */}
        <Animated.View style={{ opacity: winnerOpacity, transform: [{ scale: winnerScale }], width: '100%' }}>
          <LinearGradient
            colors={isDraw ? [Colors.brand.neonPink + '20', Colors.brand.neonBlue + '10'] : ['rgba(255,213,96,0.12)', 'rgba(255,133,0,0.06)']}
            style={s.winnerCard}
          >
            <View style={[s.winnerBorder, { borderColor: isDraw ? Colors.brand.neonPink + '50' : Colors.brand.gold + '60' }]} />
            <View style={s.winnerShine} />
            {isDraw ? (
              <>
                <Text style={s.bigEmoji}>💋</Text>
                <Text style={[s.drawText, { fontFamily: 'BebasNeue_400Regular' }]}>{t('itsADraw')}</Text>
                <Text style={[s.drawSub, { fontFamily: 'Exo2_700Bold' }]}>{t('bothWin')}</Text>
              </>
            ) : (
              <>
                <Text style={s.bigEmoji}>👑</Text>
                <Text style={[s.winnerLabel, { fontFamily: 'Exo2_700Bold' }]}>{t('winner')}</Text>
                <Text style={[s.winnerName, { fontFamily: 'BebasNeue_400Regular' }]}>{winner!.name}</Text>
                <Text style={[s.winnerScore, { fontFamily: 'Exo2_700Bold' }]}>{winner!.score} {t('pts')}</Text>
              </>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Spark divider */}
        <LinearGradient
          colors={['transparent', Colors.brand.fireHot, Colors.brand.gold, Colors.brand.fireHot, 'transparent']}
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

        {/* Prize wheel */}
        {wheelPrizes.length > 0 && (
          <View style={s.prizeSection}>
            <Text style={[s.prizeSectionTitle, { fontFamily: 'Exo2_700Bold' }]}>
              {isDraw ? t('spinCollaborative') : t('spinForPrize')}
            </Text>
            {wonPrize ? (
              <View style={s.prizeResult}>
                <Text style={s.prizeResultEmoji}>🎁</Text>
                <Text style={[s.prizeResultLabel, { fontFamily: 'Exo2_700Bold' }]}>
                  {isDraw ? t('collaborativePrize') : t('yourPrize')}
                </Text>
                <Text style={[s.prizeResultText, { fontFamily: 'BebasNeue_400Regular' }]}>{wonPrize}</Text>
                <TouchableOpacity onPress={() => setWonPrize(null)} style={s.spinAgainBtn}>
                  <Text style={s.spinAgainText}>{t('spinAgain')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <PrizeWheel
                prizes={wheelPrizes}
                spinLabel={t('spinBtn')}
                onComplete={(prize) => { Sounds.playDone(); setWonPrize(prize); }}
              />
            )}
          </View>
        )}

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

  winnerCard: {
    borderRadius: 24, padding: 32, alignItems: 'center', gap: 6,
    width: '100%', overflow: 'hidden', position: 'relative',
  },
  winnerBorder: { position: 'absolute', inset: 0, borderRadius: 24, borderWidth: 1.5 } as any,
  winnerShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '35%', backgroundColor: 'rgba(255,255,255,0.06)', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  bigEmoji: { fontSize: 52 },
  winnerLabel: { color: Colors.text.muted, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
  winnerName: { color: Colors.brand.gold, fontSize: 42, letterSpacing: 3, lineHeight: 46, textAlign: 'center' },
  winnerScore: { color: Colors.text.secondary, fontSize: 16 },
  drawText: { color: Colors.brand.neonPink, fontSize: 40, letterSpacing: 2 },
  drawSub: { color: Colors.text.secondary, fontSize: 14 },

  spark: { height: 1, width: '80%' },

  scoresRow: { flexDirection: 'row', gap: 12, width: '100%', alignItems: 'center' },
  scoreCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1.5, padding: 18, alignItems: 'center', gap: 4 },
  scoreName: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, maxWidth: 100, textAlign: 'center' },
  scorePts: { color: Colors.brand.gold, fontSize: 36, fontWeight: '900', lineHeight: 40 },
  scorePtsLabel: { color: Colors.text.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  forfeitBadge: { color: Colors.brand.crimson, fontSize: 11, fontWeight: '700', marginTop: 4 },
  vsWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  vs: { color: Colors.text.muted, fontSize: 16, letterSpacing: 1 },

  // Prize wheel
  prizeSection: { width: '100%', gap: 14, alignItems: 'center', paddingVertical: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  prizeSectionTitle: { color: Colors.brand.gold, fontSize: 15, letterSpacing: 1, textAlign: 'center' },
  prizeResult: { alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 16 },
  prizeResultEmoji: { fontSize: 48 },
  prizeResultLabel: { color: Colors.text.muted, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  prizeResultText: { color: Colors.brand.gold, fontSize: 28, letterSpacing: 2, textAlign: 'center', lineHeight: 34 },
  spinAgainBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.text.muted + '50' },
  spinAgainText: { color: Colors.text.muted, fontSize: 13, fontWeight: '700' },

  historySection: { width: '100%', gap: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  historyTitle: { color: Colors.text.secondary, fontSize: 13, letterSpacing: 1 },
  chevron: { color: Colors.text.muted, fontSize: 12 },
  historyList: { gap: 6 },

  buttons: { width: '100%', gap: 12, marginTop: 4 },
  primaryBtn: { borderRadius: 20, overflow: 'hidden', shadowColor: Colors.brand.fire, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  primaryBtnGrad: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 28, letterSpacing: 4 },
  secondaryBtn: { paddingVertical: 14, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  secondaryBtnText: { color: Colors.text.muted, fontSize: 15 },
});

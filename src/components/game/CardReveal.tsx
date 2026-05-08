import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { heTexts } from '../../data/he';
import { Card } from '../../data/types';
import { Lang } from '../../i18n';
import { resolveText } from '../../utils/resolveText';
import SpiceBadge from '../ui/SpiceBadge';

interface Props {
  card: Card;
  language: Lang;
  myGender: 'M' | 'F';
  partnerGender: 'M' | 'F';
}

const isCustomCard = (id: string) => id.startsWith('csv-') || id.startsWith('custom-');

// Heartbeat SVG line decoration
function HeartbeatLine({ color }: { color: string }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const opacity = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] });
  return (
    <Animated.View style={{ opacity }}>
      <Svg width={220} height={28} viewBox="0 0 220 28">
        <Path
          d="M 0 14 L 35 14 L 44 4 L 53 24 L 62 2 L 71 26 L 80 10 L 89 14 L 220 14"
          stroke={color}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}

export default function CardReveal({ card, language, myGender, partnerGender }: Props) {
  const isDare = card.type === 'dare';
  const typeColor    = isDare ? Colors.brand.neonPink : Colors.brand.neonBlue;
  const glowColor    = isDare ? 'rgba(255,79,163,0.18)' : 'rgba(61,214,245,0.15)';
  const cardIcon     = isDare ? '💋' : '✨';
  const typeLabel    = isDare
    ? (language === 'he' ? '🔥 חובה' : '🔥 DARE')
    : (language === 'he' ? '💬 אמת'   : '💬 TRUTH');

  const rawText    = language === 'he' ? (heTexts[card.id] ?? card.text) : card.text;
  const displayText = resolveText(rawText, myGender, partnerGender);

  const iconPulse = useRef(new Animated.Value(1)).current;
  const iconGlow  = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(iconPulse, { toValue: 1.12, duration: 1400, useNativeDriver: true }),
        Animated.timing(iconGlow,  { toValue: 1,    duration: 1400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(iconPulse, { toValue: 1,   duration: 1400, useNativeDriver: true }),
        Animated.timing(iconGlow,  { toValue: 0.6, duration: 1400, useNativeDriver: true }),
      ]),
    ])).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Glow layer behind icon */}
      <Animated.View style={[styles.iconGlow, { backgroundColor: glowColor, opacity: iconGlow }]} />

      {/* Top row: type label + custom badge */}
      <View style={styles.topRow}>
        <Text style={[styles.typeLabel, { color: typeColor, fontFamily: 'BebasNeue_400Regular' }]}>
          {typeLabel}
        </Text>
        {isCustomCard(card.id) && (
          <View style={styles.customBadge}>
            <Text style={styles.customBadgeText}>{language === 'he' ? 'מותאם' : 'CUSTOM'}</Text>
          </View>
        )}
      </View>

      {/* Spice badge */}
      <SpiceBadge level={card.level} />

      {/* Card icon (pulsing) */}
      <Animated.Text style={[styles.cardIcon, { transform: [{ scale: iconPulse }] }]}>
        {cardIcon}
      </Animated.Text>

      {/* Card text */}
      <Text style={[styles.cardText, language === 'he' && styles.rtl]}>{displayText}</Text>

      {/* Timer note */}
      {card.type === 'dare' && card.timerSeconds && (
        <View style={[styles.timerRow, { borderColor: typeColor + '40', backgroundColor: typeColor + '10' }]}>
          <Text style={[styles.timerNote, { color: typeColor }]}>
            ⏰  {card.timerSeconds >= 60 ? `${card.timerSeconds / 60} min` : `${card.timerSeconds} sec`}
          </Text>
        </View>
      )}

      {/* Heartbeat line */}
      <HeartbeatLine color={typeColor} />

      {/* Bottom heart */}
      <Text style={[styles.bottomHeart, { color: typeColor }]}>♡</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10, width: '100%', paddingVertical: 4, position: 'relative' },

  iconGlow: {
    position: 'absolute',
    width: 100, height: 100,
    borderRadius: 50,
    top: '28%',
    alignSelf: 'center',
  },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeLabel: { fontSize: 22, letterSpacing: 3, lineHeight: 26 },
  customBadge: {
    backgroundColor: Colors.brand.gold + '20',
    borderWidth: 1, borderColor: Colors.brand.gold + '80',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
  },
  customBadgeText: { color: Colors.brand.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  cardIcon: { fontSize: 52, marginVertical: 4 },

  cardText: {
    color: Colors.text.primary,
    fontSize: 17, lineHeight: 27,
    textAlign: 'center', fontWeight: '500',
    paddingHorizontal: 8,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },

  timerRow: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 5,
    marginTop: 2,
  },
  timerNote: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  bottomHeart: { fontSize: 18, marginTop: -4 },
});

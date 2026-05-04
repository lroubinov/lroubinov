import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

export default function CardReveal({ card, language, myGender, partnerGender }: Props) {
  const typeLabel = card.type === 'truth'
    ? (language === 'he' ? '💬 אמת' : '💬 TRUTH')
    : (language === 'he' ? '🔥 חובה' : '🔥 DARE');
  const typeColor = card.type === 'truth' ? Colors.brand.rose : Colors.brand.crimson;

  const rawText = language === 'he' ? (heTexts[card.id] ?? card.text) : card.text;
  const displayText = resolveText(rawText, myGender, partnerGender);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={[styles.typeLabel, { color: typeColor }]}>{typeLabel}</Text>
        {isCustomCard(card.id) && (
          <View style={styles.customBadge}>
            <Text style={styles.customBadgeText}>{language === 'he' ? 'מותאם' : 'CUSTOM'}</Text>
          </View>
        )}
      </View>
      <SpiceBadge level={card.level} />
      <Text style={[styles.cardText, language === 'he' && styles.rtl]}>{displayText}</Text>
      {card.type === 'dare' && card.timerSeconds && (
        <Text style={styles.timerNote}>
          ⏱ {card.timerSeconds >= 60 ? `${card.timerSeconds / 60} min` : `${card.timerSeconds} sec`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12, width: '100%' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  customBadge: { backgroundColor: Colors.brand.gold + '22', borderWidth: 1, borderColor: Colors.brand.gold + '88', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  customBadgeText: { color: Colors.brand.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cardText: { color: Colors.text.primary, fontSize: 17, lineHeight: 26, textAlign: 'center', fontWeight: '500' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  timerNote: { color: Colors.text.muted, fontSize: 12, marginTop: 4 },
});

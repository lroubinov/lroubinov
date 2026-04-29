import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { heTexts } from '../../data/he';
import { ForfeitCard as ForfeitCardType } from '../../data/types';
import { Lang } from '../../i18n';
import { resolveText } from '../../utils/resolveText';
import SpiceBadge from '../ui/SpiceBadge';

interface Props {
  forfeit: ForfeitCardType;
  language: Lang;
  myGender: 'M' | 'F';
  partnerGender: 'M' | 'F';
}

export default function ForfeitCard({ forfeit, language, myGender, partnerGender }: Props) {
  const rawText = language === 'he' ? (heTexts[forfeit.id] ?? forfeit.text) : forfeit.text;
  const displayText = resolveText(rawText, myGender, partnerGender);
  return (
    <LinearGradient colors={['#3D0010', '#1A000A']} style={styles.card}>
      <Text style={styles.icon}>⚡</Text>
      <SpiceBadge level={forfeit.level} />
      <Text style={[styles.text, language === 'he' && styles.rtl]}>{displayText}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 28, alignItems: 'center', gap: 14, borderWidth: 1, borderColor: Colors.brand.crimson + '60', width: '100%' },
  icon: { fontSize: 44 },
  text: { color: Colors.text.primary, fontSize: 18, lineHeight: 28, textAlign: 'center', fontWeight: '500' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});

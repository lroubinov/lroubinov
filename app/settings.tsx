import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { CardType, GameRounds } from '../src/data/types';
import { Lang, tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

const DURATIONS: { value: GameRounds; en: string; he: string }[] = [
  { value: 10, en: '10 questions', he: '10 שאלות' },
  { value: 15, en: '15 questions', he: '15 שאלות' },
  { value: 20, en: '20 questions', he: '20 שאלות' },
  { value: null, en: 'Unlimited', he: 'ללא הגבלה' },
];

function parseCsv(text: string) {
  const lines = text.replace(/\r/g, '').trim().split('\n').filter(l => l.trim());
  const cards: any[] = [];
  let skipped = 0;
  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 3) { skipped++; continue; }
    const [rawLevel, rawType, ...rest] = parts;
    const cardText = rest.join(',').trim();
    if (!['hot','scorching','hardcore'].includes(rawLevel)) { skipped++; continue; }
    if (!['truth','dare'].includes(rawType)) { skipped++; continue; }
    if (!cardText) { skipped++; continue; }
    cards.push({ id: `csv-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type: rawType as CardType, level: rawLevel as any, text: cardText });
  }
  return cards.length > 0 ? { cards, skipped } : null;
}

export default function SettingsScreen() {
  const { language, setLanguage, gameRounds, setGameRounds, customCards, addCustomCard, removeCustomCard, addCustomCards } = useGameStore();
  const t = (k: string) => tr(language, k);
  const isRtl = language === 'he';

  const [customText, setCustomText] = useState('');
  const [customType, setCustomType] = useState<CardType>('dare');
  const [csvText, setCsvText] = useState('');
  const [csvMsg, setCsvMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [showCsv, setShowCsv] = useState(false);

  const doImport = (text: string) => {
    const result = parseCsv(text);
    if (!result) { setCsvMsg({ text: t('importError'), ok: false }); return; }
    addCustomCards(result.cards);
    setCsvText('');
    const msg = result.skipped > 0
      ? `${result.cards.length} ${t('importSuccess')} (${result.skipped} skipped)`
      : `${result.cards.length} ${t('importSuccess')}`;
    setCsvMsg({ text: msg, ok: true });
    setTimeout(() => setCsvMsg(null), 3000);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['text/csv','text/plain','text/comma-separated-values'], copyToCacheDirectory: true });
      if (result.canceled) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      doImport(content);
    } catch {
      setCsvMsg({ text: t('importError'), ok: false });
    }
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.heading, isRtl && styles.rtl]}>{t('settingsTitle')}</Text>

        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>{t('languageSection')}</Text>
        <View style={styles.langRow}>
          {(['en','he'] as Lang[]).map(lang => (
            <TouchableOpacity key={lang} style={[styles.langBtn, language===lang && styles.langBtnActive]} onPress={() => setLanguage(lang)}>
              <Text style={[styles.langBtnText, language===lang && styles.langBtnTextActive]}>{lang==='en' ? '🇺🇸  English' : '🇮🇱  עברית'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>{t('durationSection')}</Text>
        <View style={styles.durationGrid}>
          {DURATIONS.map(({ value, en, he }) => {
            const label = language==='he' ? he : en;
            const active = gameRounds === value;
            return (
              <TouchableOpacity key={String(value)} style={[styles.durationBtn, active && styles.durationBtnActive]} onPress={() => setGameRounds(value)}>
                <Text style={[styles.durationBtnText, active && styles.durationBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowCustom(v => !v)}>
          <Text style={styles.sectionLabel}>{t('customSection')} {customCards.length > 0 ? `(${customCards.length})` : ''}</Text>
          <Text style={styles.chevron}>{showCustom ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCustom && (
          <View style={styles.panel}>
            <View style={styles.typeRow}>
              {(['truth','dare'] as CardType[]).map(type => (
                <TouchableOpacity key={type} style={[styles.typeBtn, customType===type && styles.typeBtnActive]} onPress={() => setCustomType(type)}>
                  <Text style={[styles.typeBtnText, customType===type && styles.typeBtnTextActive]}>{type==='truth' ? t('truthBtn') : t('dareBtn')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.textInput, isRtl && styles.rtl]} placeholder={customType==='truth' ? t('writeQuestion') : t('writeDare')} placeholderTextColor={Colors.text.muted} value={customText} onChangeText={setCustomText} multiline maxLength={200} />
            <TouchableOpacity style={[styles.addBtn, !customText.trim() && styles.addBtnDisabled]} onPress={() => { if (!customText.trim()) return; addCustomCard(customText.trim(), customType); setCustomText(''); }}>
              <Text style={styles.addBtnText}>{t('addBtn')}</Text>
            </TouchableOpacity>
            {customCards.map(c => (
              <View key={c.id} style={styles.customCard}>
                <Text style={styles.customCardBadge}>{c.type==='truth' ? '🔮' : '⚡'}</Text>
                <Text style={[styles.customCardText, isRtl && styles.rtl]} numberOfLines={3}>{c.text}</Text>
                <TouchableOpacity onPress={() => removeCustomCard(c.id)}><Text style={styles.deleteBtnText}>✕</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowCsv(v => !v)}>
          <Text style={styles.sectionLabel}>{t('csvSection')}</Text>
          <Text style={styles.chevron}>{showCsv ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCsv && (
          <View style={styles.panel}>
            <Text style={styles.csvHelp}>{t('csvHelp')}</Text>
            <GlowButton label={t('pickCsvFile')} onPress={pickFile} colors={['#1a3a00','#3D7000']} style={styles.pickBtn} fontSize={15} />
            <Text style={styles.orText}>— {language==='he' ? 'או הדבק טקסט' : 'or paste text'} —</Text>
            <TextInput style={[styles.textInput, styles.csvInput]} placeholder={t('csvPlaceholder')} placeholderTextColor={Colors.text.muted} value={csvText} onChangeText={setCsvText} multiline autoCorrect={false} autoCapitalize="none" />
            {csvMsg && <Text style={[styles.csvMsg, csvMsg.ok ? styles.csvMsgOk : styles.csvMsgErr]}>{csvMsg.text}</Text>}
            <GlowButton label={t('importBtn')} onPress={() => doImport(csvText)} colors={['#1a3a00','#3D7000']} fontSize={15} />
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 60, gap: 12 },
  back: { alignSelf: 'flex-start', marginBottom: 4 },
  backText: { color: Colors.text.secondary, fontSize: 15 },
  heading: { color: Colors.brand.gold, fontSize: 26, fontWeight: '900', marginBottom: 8 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  sectionLabel: { color: Colors.text.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 8 },
  chevron: { color: Colors.text.muted, fontSize: 12 },
  langRow: { flexDirection: 'row', gap: 12 },
  langBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  langBtnActive: { borderColor: Colors.brand.gold, backgroundColor: 'rgba(244,197,66,0.12)' },
  langBtnText: { color: Colors.text.muted, fontWeight: '700', fontSize: 15 },
  langBtnTextActive: { color: Colors.brand.gold },
  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  durationBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.03)', minWidth: '46%', flex: 1, alignItems: 'center' },
  durationBtnActive: { borderColor: Colors.brand.purple, backgroundColor: 'rgba(123,47,190,0.2)' },
  durationBtnText: { color: Colors.text.muted, fontWeight: '700', fontSize: 14 },
  durationBtnTextActive: { color: Colors.brand.purpleLight },
  panel: { gap: 10, paddingHorizontal: 4 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  typeBtnActive: { borderColor: Colors.brand.gold, backgroundColor: 'rgba(244,197,66,0.12)' },
  typeBtnText: { color: Colors.text.muted, fontWeight: '700', fontSize: 14 },
  typeBtnTextActive: { color: Colors.brand.gold },
  textInput: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', color: Colors.text.primary, fontSize: 14, padding: 12, minHeight: 72, textAlignVertical: 'top' },
  csvInput: { minHeight: 100, fontFamily: 'monospace', fontSize: 12 },
  addBtn: { backgroundColor: Colors.brand.purple, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: Colors.text.primary, fontWeight: '800', fontSize: 15 },
  customCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 },
  customCardBadge: { fontSize: 16, marginTop: 1 },
  customCardText: { flex: 1, color: Colors.text.secondary, fontSize: 13, lineHeight: 18 },
  deleteBtnText: { color: Colors.text.muted, fontSize: 14, fontWeight: '700', padding: 4 },
  csvHelp: { color: Colors.text.muted, fontSize: 12, lineHeight: 18, fontFamily: 'monospace' },
  pickBtn: { marginBottom: 4 },
  orText: { color: Colors.text.muted, textAlign: 'center', fontSize: 12, marginVertical: 4 },
  csvMsg: { fontSize: 13, fontWeight: '700', textAlign: 'center', paddingVertical: 6 },
  csvMsgOk: { color: '#6FCF4A' },
  csvMsgErr: { color: Colors.brand.crimson },
});

import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { CardType } from '../src/data/types';
import { Lang, tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

function parseCsv(text: string, lang: Lang) {
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
    cards.push({
      id: `csv-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      type: rawType as CardType,
      level: rawLevel as any,
      text: cardText,
      lang,
    });
  }
  return cards.length > 0 ? { cards, skipped } : null;
}

// +/- round count spinner (1–99, or null = unlimited)
function RoundSpinner({ value, onChange, unlimitedLabel }: { value: number | null; onChange: (v: number | null) => void; unlimitedLabel: string }) {
  const dec = () => {
    if (value === null) onChange(10);
    else if (value <= 1) onChange(1);
    else onChange(value - 1);
  };
  const inc = () => {
    if (value === null) onChange(1);
    else if (value >= 99) onChange(99);
    else onChange(value + 1);
  };
  return (
    <View style={sp.wrap}>
      <View style={sp.row}>
        <TouchableOpacity style={sp.btn} onPress={dec} disabled={value !== null && value <= 1}>
          <Text style={[sp.btnText, value !== null && value <= 1 && sp.btnDisabled]}>−</Text>
        </TouchableOpacity>
        <View style={sp.display}>
          <Text style={sp.value}>{value === null ? '∞' : value}</Text>
          <Text style={sp.label}>{value === null ? unlimitedLabel : value === 1 ? 'question' : 'questions'}</Text>
        </View>
        <TouchableOpacity style={sp.btn} onPress={inc} disabled={value !== null && value >= 99}>
          <Text style={[sp.btnText, value !== null && value >= 99 && sp.btnDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
      {/* Infinity shortcut pill */}
      <TouchableOpacity
        style={[sp.infBtn, value === null && sp.infBtnActive]}
        onPress={() => onChange(null)}
      >
        <Text style={[sp.infBtnText, value === null && sp.infBtnTextActive]}>
          ∞  {unlimitedLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const sp = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  btn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.brand.purpleLight + '80', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(123,47,190,0.15)' },
  btnText: { color: Colors.brand.purpleLight, fontSize: 24, fontWeight: '300', lineHeight: 28 },
  btnDisabled: { opacity: 0.3 },
  display: { alignItems: 'center', minWidth: 100 },
  value: { color: Colors.brand.gold, fontSize: 40, fontWeight: '900', lineHeight: 44 },
  label: { color: Colors.text.muted, fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  infBtn: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.brand.purpleLight + '50', backgroundColor: 'rgba(123,47,190,0.08)' },
  infBtnActive: { borderColor: Colors.brand.gold, backgroundColor: 'rgba(255,213,96,0.12)' },
  infBtnText: { color: Colors.text.muted, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  infBtnTextActive: { color: Colors.brand.gold },
});

export default function SettingsScreen() {
  const {
    language, setLanguage, gameRounds, setGameRounds,
    customCards, addCustomCard, removeCustomCard, removeCustomCards, addCustomCards, clearCustomCards,
  } = useGameStore();
  const t = (k: string) => tr(language, k);
  const isRtl = language === 'he';

  const [customText, setCustomText] = useState('');
  const [customType, setCustomType] = useState<CardType>('dare');
  const [csvText, setCsvText] = useState('');
  const [csvMsg, setCsvMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const doDeleteSelected = () => {
    removeCustomCards([...selected]);
    setSelected(new Set());
    setSelectMode(false);
  };

  const doImport = (text: string) => {
    const result = parseCsv(text, language);
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
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      const content = await new File(uri).text();
      if (!content || content.trim().length === 0) {
        setCsvMsg({ text: 'File is empty', ok: false });
        return;
      }
      doImport(content);
    } catch (e: any) {
      setCsvMsg({ text: `Error: ${e?.message ?? 'unknown'}`, ok: false });
    }
  };

  // Cards visible for current language only
  const visibleCards = customCards.filter(c => c.lang === language);
  const otherLangCount = customCards.length - visibleCards.length;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.heading, isRtl && styles.rtl]}>{t('settingsTitle')}</Text>

        {/* Language */}
        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>{t('languageSection')}</Text>
        <View style={styles.langRow}>
          {(['en','he'] as Lang[]).map(lang => (
            <TouchableOpacity key={lang} style={[styles.langBtn, language===lang && styles.langBtnActive]} onPress={() => setLanguage(lang)}>
              <Text style={[styles.langBtnText, language===lang && styles.langBtnTextActive]}>{lang==='en' ? '🇺🇸  English' : '🇮🇱  עברית'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Duration — spinner */}
        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>{t('durationSection')}</Text>
        <View style={styles.spinnerWrap}>
          <RoundSpinner value={gameRounds} onChange={setGameRounds} unlimitedLabel={t('unlimitedLabel')} />
        </View>

        {/* Custom questions */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => { setShowCustom(v => !v); setSelectMode(false); setSelected(new Set()); }}>
          <Text style={styles.sectionLabel}>
            {t('customSection')}{visibleCards.length > 0 ? ` (${visibleCards.length})` : ''}
            {otherLangCount > 0 ? ` +${otherLangCount} other lang` : ''}
          </Text>
          <Text style={styles.chevron}>{showCustom ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCustom && (
          <View style={styles.panel}>
            {/* Add new card */}
            <View style={styles.typeRow}>
              {(['truth','dare'] as CardType[]).map(type => (
                <TouchableOpacity key={type} style={[styles.typeBtn, customType===type && styles.typeBtnActive]} onPress={() => setCustomType(type)}>
                  <Text style={[styles.typeBtnText, customType===type && styles.typeBtnTextActive]}>{type==='truth' ? t('truthBtn') : t('dareBtn')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.textInput, isRtl && styles.rtl]}
              placeholder={customType==='truth' ? t('writeQuestion') : t('writeDare')}
              placeholderTextColor={Colors.text.muted}
              value={customText}
              onChangeText={setCustomText}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.addBtn, !customText.trim() && styles.addBtnDisabled]}
              onPress={() => {
                if (!customText.trim()) return;
                addCustomCard(customText.trim(), customType, language);
                setCustomText('');
              }}
            >
              <Text style={styles.addBtnText}>{t('addBtn')}</Text>
            </TouchableOpacity>

            {/* Toolbar: select / delete-all */}
            {visibleCards.length > 0 && (
              <View style={styles.toolbar}>
                <TouchableOpacity onPress={() => { setSelectMode(v => !v); setSelected(new Set()); }}>
                  <Text style={styles.toolbarBtn}>{selectMode ? t('cancelSelect') : t('selectMode')}</Text>
                </TouchableOpacity>
                {selectMode && selected.size > 0 && (
                  <TouchableOpacity onPress={doDeleteSelected}>
                    <Text style={[styles.toolbarBtn, styles.toolbarDanger]}>{t('deleteSelected')} ({selected.size})</Text>
                  </TouchableOpacity>
                )}
                {!selectMode && (
                  <TouchableOpacity onPress={() => { clearCustomCards(); }}>
                    <Text style={[styles.toolbarBtn, styles.toolbarDanger]}>{t('clearAll')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Card list — current language only */}
            {visibleCards.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.customCard, selectMode && selected.has(c.id) && styles.customCardSelected]}
                onPress={() => selectMode && toggleSelect(c.id)}
                activeOpacity={selectMode ? 0.7 : 1}
              >
                {selectMode && (
                  <View style={[styles.checkbox, selected.has(c.id) && styles.checkboxChecked]}>
                    {selected.has(c.id) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                )}
                <Text style={styles.customCardBadge}>{c.type==='truth' ? '🔮' : '⚡'}</Text>
                <Text style={[styles.customCardText, isRtl && styles.rtl]} numberOfLines={3}>{c.text}</Text>
                {!selectMode && (
                  <TouchableOpacity onPress={() => removeCustomCard(c.id)}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            {visibleCards.length === 0 && customCards.length > 0 && (
              <Text style={styles.emptyNote}>{language === 'he' ? 'אין שאלות מותאמות לעברית' : 'No custom questions for English'}</Text>
            )}
          </View>
        )}

        {/* CSV import */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowCsv(v => !v)}>
          <Text style={styles.sectionLabel}>{t('csvSection')}</Text>
          <Text style={styles.chevron}>{showCsv ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCsv && (
          <View style={styles.panel}>
            <Text style={styles.csvHelp}>{t('csvHelp')}</Text>
            <GlowButton label={t('pickCsvFile')} onPress={pickFile} colors={['#1a3a00','#3D7000']} style={styles.pickBtn} fontSize={15} />
            <Text style={styles.orText}>— {language==='he' ? 'או הדבק טקסט' : 'or paste text'} —</Text>
            <TextInput
              style={[styles.textInput, styles.csvInput]}
              placeholder={t('csvPlaceholder')}
              placeholderTextColor={Colors.text.muted}
              value={csvText}
              onChangeText={setCsvText}
              multiline
              autoCorrect={false}
              autoCapitalize="none"
            />
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
  spinnerWrap: { paddingVertical: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
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
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  toolbarBtn: { color: Colors.text.muted, fontSize: 13, fontWeight: '700', paddingVertical: 4, paddingHorizontal: 2 },
  toolbarDanger: { color: Colors.brand.crimson },
  customCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 },
  customCardSelected: { backgroundColor: 'rgba(123,47,190,0.2)', borderWidth: 1, borderColor: Colors.brand.purpleLight + '60' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.text.muted, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: Colors.brand.purple, borderColor: Colors.brand.purple },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '800' },
  customCardBadge: { fontSize: 16, marginTop: 1 },
  customCardText: { flex: 1, color: Colors.text.secondary, fontSize: 13, lineHeight: 18 },
  deleteBtnText: { color: Colors.text.muted, fontSize: 14, fontWeight: '700', padding: 4 },
  emptyNote: { color: Colors.text.muted, fontSize: 13, textAlign: 'center', paddingVertical: 8, fontStyle: 'italic' },
  csvHelp: { color: Colors.text.muted, fontSize: 12, lineHeight: 18, fontFamily: 'monospace' },
  pickBtn: { marginBottom: 4 },
  orText: { color: Colors.text.muted, textAlign: 'center', fontSize: 12, marginVertical: 4 },
  csvMsg: { fontSize: 13, fontWeight: '700', textAlign: 'center', paddingVertical: 6 },
  csvMsgOk: { color: '#6FCF4A' },
  csvMsgErr: { color: Colors.brand.crimson },
});

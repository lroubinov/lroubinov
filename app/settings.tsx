import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { CardType, Prize } from '../src/data/types';
import { defaultPrizes } from '../src/data/prizes';
import { Lang, tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

// ─── CSV parsers ─────────────────────────────────────────────────────────────

function parseCsv(text: string, lang: Lang, packId?: string) {
  const lines = text.replace(/\r/g, '').trim().split('\n').filter(l => l.trim());
  const cards: any[] = [];
  let skipped = 0;
  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 3) { skipped++; continue; }
    const [rawLevel, rawType, ...rest] = parts;
    if (!['hot','scorching','hardcore'].includes(rawLevel)) { skipped++; continue; }
    if (!['truth','dare'].includes(rawType)) { skipped++; continue; }

    // Detect optional 4th column: timer (positive integer as last part)
    let timerSeconds: number | undefined;
    let textParts = [...rest];
    if (rest.length >= 2) {
      const lastPart = rest[rest.length - 1];
      const maybeTimer = parseInt(lastPart, 10);
      if (!isNaN(maybeTimer) && maybeTimer > 0 && String(maybeTimer) === lastPart) {
        timerSeconds = maybeTimer;
        textParts = rest.slice(0, -1);
      }
    }
    const cardText = textParts.join(',').trim();
    if (!cardText) { skipped++; continue; }

    cards.push({
      id: `csv-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      type: rawType as CardType,
      level: rawLevel as any,
      text: cardText,
      lang,
      timerSeconds,
      packId,
    });
  }
  return cards.length > 0 ? { cards, skipped } : null;
}

function parsePrizeCsv(text: string, lang: Lang): { prizes: Prize[]; skipped: number } | null {
  const lines = text.replace(/\r/g, '').trim().split('\n').filter(l => l.trim());
  const prizes: Prize[] = [];
  let skipped = 0;
  for (const line of lines) {
    const idx = line.indexOf(',');
    if (idx < 0) { skipped++; continue; }
    const kind = line.slice(0, idx).trim().toLowerCase();
    const prizeText = line.slice(idx + 1).trim();
    if (!prizeText) { skipped++; continue; }
    if (kind !== 'individual' && kind !== 'collaborative') { skipped++; continue; }
    prizes.push({
      id: `prize-csv-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      text: prizeText,
      lang,
      collaborative: kind === 'collaborative',
    });
  }
  return prizes.length > 0 ? { prizes, skipped } : null;
}

// ─── Round spinner ────────────────────────────────────────────────────────────
function RoundSpinner({ value, onChange, unlimitedLabel }: { value: number | null; onChange: (v: number | null) => void; unlimitedLabel: string }) {
  const dec = () => { if (value !== null && value > 1) onChange(value - 1); };
  const inc = () => { if (value !== null && value < 99) onChange(value + 1); else if (value === null) onChange(1); };
  return (
    <View style={sp.wrap}>
      <View style={sp.row}>
        <TouchableOpacity style={sp.btn} onPress={dec} disabled={value !== null && value <= 1}>
          <Text style={[sp.btnText, value !== null && value <= 1 && sp.dim]}>−</Text>
        </TouchableOpacity>
        <View style={sp.display}>
          <Text style={sp.value}>{value === null ? '∞' : value}</Text>
          <Text style={sp.label}>{value === null ? unlimitedLabel : value === 1 ? 'question' : 'questions'}</Text>
        </View>
        <TouchableOpacity style={sp.btn} onPress={inc} disabled={value !== null && value >= 99}>
          <Text style={[sp.btnText, value !== null && value >= 99 && sp.dim]}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[sp.infBtn, value === null && sp.infBtnActive]} onPress={() => onChange(null)}>
        <Text style={[sp.infText, value === null && sp.infTextActive]}>∞  {unlimitedLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const sp = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  btn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.brand.purpleLight + '80', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(123,47,190,0.15)' },
  btnText: { color: Colors.brand.purpleLight, fontSize: 24, fontWeight: '300', lineHeight: 28 },
  dim: { opacity: 0.3 },
  display: { alignItems: 'center', minWidth: 100 },
  value: { color: Colors.brand.gold, fontSize: 40, fontWeight: '900', lineHeight: 44 },
  label: { color: Colors.text.muted, fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  infBtn: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.brand.purpleLight + '50', backgroundColor: 'rgba(123,47,190,0.08)' },
  infBtnActive: { borderColor: Colors.brand.gold, backgroundColor: 'rgba(255,213,96,0.12)' },
  infText: { color: Colors.text.muted, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  infTextActive: { color: Colors.brand.gold },
});

// ─── Timer picker ─────────────────────────────────────────────────────────────
const TIMER_OPTIONS = [0, 30, 60, 90] as const;

function TimerPicker({ value, onChange, noneLabel }: { value: number; onChange: (v: number) => void; noneLabel: string }) {
  return (
    <View style={tp.row}>
      {TIMER_OPTIONS.map(opt => (
        <TouchableOpacity key={opt} style={[tp.btn, value === opt && tp.btnActive]} onPress={() => onChange(opt)}>
          <Text style={[tp.text, value === opt && tp.textActive]}>
            {opt === 0 ? noneLabel : `${opt}s`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const tp = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  btnActive: { borderColor: Colors.brand.fire, backgroundColor: 'rgba(255,69,0,0.15)' },
  text: { color: Colors.text.muted, fontSize: 13, fontWeight: '700' },
  textActive: { color: Colors.brand.fire },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const {
    language, setLanguage, gameRounds, setGameRounds,
    globalDareTimer, setGlobalDareTimer,
    customCards, addCustomCard, removeCustomCard, removeCustomCards, addCustomCards, clearCustomCards,
    packs, addPack, removePack, togglePack, disabledPackIds,
    customPrizes, addPrize, addPrizes, removePrize, clearCustomPrizes,
  } = useGameStore();
  const t = (k: string) => tr(language, k);
  const isRtl = language === 'he';

  // Custom card form state
  const [customText, setCustomText]   = useState('');
  const [customType, setCustomType]   = useState<CardType>('dare');
  const [customTimer, setCustomTimer] = useState(0);
  const [customPackId, setCustomPackId] = useState<string | undefined>(undefined);

  // CSV state
  const [csvText, setCsvText]   = useState('');
  const [csvMsg, setCsvMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [csvPackName, setCsvPackName] = useState('');
  const [showCsvPackInput, setShowCsvPackInput] = useState(false);

  // Prize state
  const [newPrizeText, setNewPrizeText]         = useState('');
  const [newPrizeCollab, setNewPrizeCollab]      = useState(false);
  const [prizeCsvText, setPrizeCsvText]          = useState('');
  const [prizeCsvMsg, setPrizeCsvMsg]            = useState<{ text: string; ok: boolean } | null>(null);

  // Collapsible panels
  const [showCustom, setShowCustom]   = useState(false);
  const [showCsv, setShowCsv]         = useState(false);
  const [showPacks, setShowPacks]     = useState(false);
  const [showPrizes, setShowPrizes]   = useState(false);

  // Multi-select
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected]     = useState<Set<string>>(new Set());

  // Pack creation
  const [newPackName, setNewPackName]   = useState('');
  const [newPackEmoji, setNewPackEmoji] = useState('📦');

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const doDeleteSelected = () => {
    removeCustomCards([...selected]);
    setSelected(new Set());
    setSelectMode(false);
  };

  const doImport = (text: string) => {
    // If user wants a named pack, create it first
    let packId: string | undefined;
    if (csvPackName.trim()) {
      packId = addPack(csvPackName.trim(), '📦', language);
    }
    const result = parseCsv(text, language, packId);
    if (!result) {
      setCsvMsg({ text: t('importError'), ok: false });
      return;
    }
    addCustomCards(result.cards);
    setCsvText('');
    setCsvPackName('');
    setShowCsvPackInput(false);
    setCsvMsg({ text: `${result.cards.length} ${t('importSuccess')}${result.skipped > 0 ? ` (${result.skipped} skipped)` : ''}`, ok: true });
    setTimeout(() => setCsvMsg(null), 3000);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const content = await new File(result.assets[0].uri).text();
      if (!content?.trim()) { setCsvMsg({ text: 'File is empty', ok: false }); return; }
      doImport(content);
    } catch (e: any) {
      setCsvMsg({ text: `Error: ${e?.message ?? 'unknown'}`, ok: false });
    }
  };

  const doImportPrizes = (text: string) => {
    const result = parsePrizeCsv(text, language);
    if (!result) { setPrizeCsvMsg({ text: t('importError'), ok: false }); return; }
    addPrizes(result.prizes);
    setPrizeCsvText('');
    setPrizeCsvMsg({ text: `${result.prizes.length} ${t('importSuccess')}`, ok: true });
    setTimeout(() => setPrizeCsvMsg(null), 3000);
  };

  const handleCreatePack = () => {
    if (!newPackName.trim()) return;
    addPack(newPackName.trim(), newPackEmoji, language);
    setNewPackName('');
    setNewPackEmoji('📦');
  };

  // Cards for current language only
  const visibleCards = customCards.filter(c => c.lang === language);
  // Packs for current language
  const visiblePacks = packs.filter(p => p.lang === language);
  // Prizes for current language
  const visiblePrizes        = customPrizes.filter(p => p.lang === language);
  const visibleIndividual    = visiblePrizes.filter(p => !p.collaborative);
  const visibleCollaborative = visiblePrizes.filter(p => p.collaborative);

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.heading, isRtl && styles.rtl]}>{t('settingsTitle')}</Text>

        {/* ── Language ── */}
        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>{t('languageSection')}</Text>
        <View style={styles.langRow}>
          {(['en','he'] as Lang[]).map(lang => (
            <TouchableOpacity key={lang} style={[styles.langBtn, language===lang && styles.langBtnActive]} onPress={() => setLanguage(lang)}>
              <Text style={[styles.langBtnText, language===lang && styles.langBtnTextActive]}>{lang==='en' ? '🇺🇸  English' : '🇮🇱  עברית'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Duration ── */}
        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>{t('durationSection')}</Text>
        <View style={styles.spinnerWrap}>
          <RoundSpinner value={gameRounds} onChange={setGameRounds} unlimitedLabel={t('unlimitedLabel')} />
        </View>

        {/* ── Global Dare Timer ── */}
        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>{t('globalTimerSection')}</Text>
        <Text style={[styles.globalTimerDesc, isRtl && styles.rtl]}>{t('globalTimerDesc')}</Text>
        <View style={styles.spinnerWrap}>
          <TimerPicker value={globalDareTimer} onChange={setGlobalDareTimer} noneLabel={t('timerNone')} />
        </View>

        {/* ── Packs ── */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowPacks(v => !v)}>
          <Text style={styles.sectionLabel}>{t('packsSection')}{visiblePacks.length > 0 ? ` (${visiblePacks.length})` : ''}</Text>
          <Text style={styles.chevron}>{showPacks ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showPacks && (
          <View style={styles.panel}>
            <View style={styles.packCreateRow}>
              <TextInput
                style={styles.emojiInput}
                value={newPackEmoji}
                onChangeText={setNewPackEmoji}
                maxLength={2}
              />
              <TextInput
                style={[styles.textInput, { flex: 1, minHeight: 44, paddingVertical: 8 }]}
                placeholder={t('packNamePlaceholder')}
                placeholderTextColor={Colors.text.muted}
                value={newPackName}
                onChangeText={setNewPackName}
              />
              <TouchableOpacity style={[styles.addBtn, { paddingHorizontal: 14 }]} onPress={handleCreatePack}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {visiblePacks.length === 0 && (
              <Text style={styles.emptyNote}>{t('noPacks')}</Text>
            )}
            {visiblePacks.map(pack => {
              const count = visibleCards.filter(c => c.packId === pack.id).length;
              const disabled = disabledPackIds.includes(pack.id);
              return (
                <View key={pack.id} style={styles.packRow}>
                  <Text style={styles.packEmoji}>{pack.emoji}</Text>
                  <View style={styles.packInfo}>
                    <Text style={styles.packName}>{pack.name}</Text>
                    <Text style={styles.packCount}>{count} {t('packQuestions')}</Text>
                  </View>
                  <Switch
                    value={!disabled}
                    onValueChange={() => togglePack(pack.id)}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.brand.fire + '80' }}
                    thumbColor={disabled ? Colors.text.muted : Colors.brand.gold}
                  />
                  <TouchableOpacity onPress={() => removePack(pack.id)} style={{ paddingLeft: 8 }}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Custom Questions ── */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => { setShowCustom(v => !v); setSelectMode(false); setSelected(new Set()); }}>
          <Text style={styles.sectionLabel}>
            {t('customSection')}{visibleCards.length > 0 ? ` (${visibleCards.length})` : ''}
          </Text>
          <Text style={styles.chevron}>{showCustom ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCustom && (
          <View style={styles.panel}>
            <View style={styles.typeRow}>
              {(['truth','dare'] as CardType[]).map(type => (
                <TouchableOpacity key={type} style={[styles.typeBtn, customType===type && styles.typeBtnActive]} onPress={() => { setCustomType(type); if (type === 'truth') setCustomTimer(0); }}>
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

            {customType === 'dare' && (
              <View style={styles.timerWrap}>
                <Text style={styles.timerLabel}>⏱ {t('timerLabel')}</Text>
                <TimerPicker value={customTimer} onChange={setCustomTimer} noneLabel={t('timerNone')} />
              </View>
            )}

            {visiblePacks.length > 0 && (
              <View style={styles.packAssignRow}>
                <Text style={styles.timerLabel}>📦 {t('assignPack')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.packChip, !customPackId && styles.packChipActive]}
                      onPress={() => setCustomPackId(undefined)}
                    >
                      <Text style={[styles.packChipText, !customPackId && styles.packChipTextActive]}>{t('noPack')}</Text>
                    </TouchableOpacity>
                    {visiblePacks.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.packChip, customPackId === p.id && styles.packChipActive]}
                        onPress={() => setCustomPackId(p.id)}
                      >
                        <Text style={[styles.packChipText, customPackId === p.id && styles.packChipTextActive]}>
                          {p.emoji} {p.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={[styles.addBtn, !customText.trim() && styles.addBtnDisabled]}
              onPress={() => {
                if (!customText.trim()) return;
                addCustomCard(customText.trim(), customType, language, customTimer > 0 ? customTimer : undefined, customPackId);
                setCustomText('');
                setCustomTimer(0);
              }}
            >
              <Text style={styles.addBtnText}>{t('addBtn')}</Text>
            </TouchableOpacity>

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
                  <TouchableOpacity onPress={clearCustomCards}>
                    <Text style={[styles.toolbarBtn, styles.toolbarDanger]}>{t('clearAll')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {visibleCards.length === 0 && (
              <Text style={styles.emptyNote}>{language === 'he' ? 'אין שאלות מותאמות לעברית' : 'No custom questions for English'}</Text>
            )}
            {visibleCards.map(c => {
              const pack = c.packId ? packs.find(p => p.id === c.packId) : undefined;
              return (
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
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.customCardText, isRtl && styles.rtl]} numberOfLines={2}>{c.text}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      {pack && <Text style={styles.cardMeta}>{pack.emoji} {pack.name}</Text>}
                      {c.timerSeconds ? <Text style={styles.cardMeta}>⏱ {c.timerSeconds}s</Text> : null}
                    </View>
                  </View>
                  {!selectMode && (
                    <TouchableOpacity onPress={() => removeCustomCard(c.id)}>
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── CSV Import ── */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowCsv(v => !v)}>
          <Text style={styles.sectionLabel}>{t('csvSection')}</Text>
          <Text style={styles.chevron}>{showCsv ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCsv && (
          <View style={styles.panel}>
            <Text style={styles.csvHelp}>{t('csvHelp')}</Text>

            {/* Named pack for CSV import */}
            <TouchableOpacity
              style={styles.csvPackToggle}
              onPress={() => setShowCsvPackInput(v => !v)}
            >
              <Text style={styles.csvPackToggleText}>
                {showCsvPackInput ? '▲' : '▼'}  {language === 'he' ? 'ייבא לחבילה חדשה (אופציונלי)' : 'Import into a new pack (optional)'}
              </Text>
            </TouchableOpacity>
            {showCsvPackInput && (
              <TextInput
                style={[styles.textInput, { minHeight: 44, paddingVertical: 8 }]}
                placeholder={language === 'he' ? 'שם החבילה...' : 'Pack name...'}
                placeholderTextColor={Colors.text.muted}
                value={csvPackName}
                onChangeText={setCsvPackName}
              />
            )}

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

        {/* ── Prizes ── */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowPrizes(v => !v)}>
          <Text style={styles.sectionLabel}>{t('prizesSection')}{visiblePrizes.length > 0 ? ` (${visiblePrizes.length})` : ''}</Text>
          <Text style={styles.chevron}>{showPrizes ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showPrizes && (
          <View style={styles.panel}>
            {/* Add prize form */}
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, !newPrizeCollab && styles.typeBtnActive]}
                onPress={() => setNewPrizeCollab(false)}
              >
                <Text style={[styles.typeBtnText, !newPrizeCollab && styles.typeBtnTextActive]}>🏆 {t('individualPrize')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, newPrizeCollab && styles.typeBtnActive]}
                onPress={() => setNewPrizeCollab(true)}
              >
                <Text style={[styles.typeBtnText, newPrizeCollab && styles.typeBtnTextActive]}>💑 {t('collaborativePrizeLabel')}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.textInput, isRtl && styles.rtl]}
              placeholder={t('writePrize')}
              placeholderTextColor={Colors.text.muted}
              value={newPrizeText}
              onChangeText={setNewPrizeText}
              maxLength={100}
            />
            <TouchableOpacity
              style={[styles.addBtn, !newPrizeText.trim() && styles.addBtnDisabled]}
              onPress={() => {
                if (!newPrizeText.trim()) return;
                addPrize(newPrizeText.trim(), newPrizeCollab, language);
                setNewPrizeText('');
              }}
            >
              <Text style={styles.addBtnText}>{t('addPrize')}</Text>
            </TouchableOpacity>

            {/* Prize CSV import */}
            <Text style={styles.csvHelp}>{t('prizeCsvHelp')}</Text>
            <TextInput
              style={[styles.textInput, styles.csvInput]}
              placeholder={t('prizeCsvPlaceholder')}
              placeholderTextColor={Colors.text.muted}
              value={prizeCsvText}
              onChangeText={setPrizeCsvText}
              multiline
              autoCorrect={false}
              autoCapitalize="none"
            />
            {prizeCsvMsg && <Text style={[styles.csvMsg, prizeCsvMsg.ok ? styles.csvMsgOk : styles.csvMsgErr]}>{prizeCsvMsg.text}</Text>}
            <GlowButton label={t('importPrizes')} onPress={() => doImportPrizes(prizeCsvText)} colors={['#1a3a00','#3D7000']} fontSize={15} />

            {/* Load built-in prizes button — only when no custom prizes yet */}
            {visiblePrizes.length === 0 && (
              <TouchableOpacity
                style={styles.loadDefaultsBtn}
                onPress={() => {
                  const defaults = defaultPrizes.filter(p => p.lang === language);
                  addPrizes(defaults);
                }}
              >
                <Text style={styles.loadDefaultsText}>{t('loadDefaultPrizes')}</Text>
              </TouchableOpacity>
            )}

            {/* Prize list */}
            {visiblePrizes.length === 0 && (
              <Text style={styles.emptyNote}>{t('noPrizes')}</Text>
            )}
            {visibleIndividual.length > 0 && (
              <>
                <Text style={styles.prizeGroupLabel}>🏆 {t('individualPrize')}</Text>
                {visibleIndividual.map(p => (
                  <View key={p.id} style={styles.prizeRow}>
                    <Text style={styles.prizeText} numberOfLines={2}>{p.text}</Text>
                    <TouchableOpacity onPress={() => removePrize(p.id)}>
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
            {visibleCollaborative.length > 0 && (
              <>
                <Text style={styles.prizeGroupLabel}>💑 {t('collaborativePrizeLabel')}</Text>
                {visibleCollaborative.map(p => (
                  <View key={p.id} style={styles.prizeRow}>
                    <Text style={styles.prizeText} numberOfLines={2}>{p.text}</Text>
                    <TouchableOpacity onPress={() => removePrize(p.id)}>
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
            {visiblePrizes.length > 0 && (
              <TouchableOpacity onPress={clearCustomPrizes} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                <Text style={[styles.toolbarBtn, styles.toolbarDanger]}>{t('clearAll')}</Text>
              </TouchableOpacity>
            )}
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
  globalTimerDesc: { color: Colors.text.muted, fontSize: 12, marginBottom: 10, opacity: 0.7 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 8 },
  chevron: { color: Colors.text.muted, fontSize: 12 },
  langRow: { flexDirection: 'row', gap: 12 },
  langBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  langBtnActive: { borderColor: Colors.brand.gold, backgroundColor: 'rgba(244,197,66,0.12)' },
  langBtnText: { color: Colors.text.muted, fontWeight: '700', fontSize: 15 },
  langBtnTextActive: { color: Colors.brand.gold },
  spinnerWrap: { paddingVertical: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  panel: { gap: 10, paddingHorizontal: 4 },
  // Packs
  packCreateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  emojiInput: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', color: Colors.text.primary, fontSize: 22, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 },
  packEmoji: { fontSize: 22 },
  packInfo: { flex: 1 },
  packName: { color: Colors.text.primary, fontSize: 15, fontWeight: '700' },
  packCount: { color: Colors.text.muted, fontSize: 12 },
  // Card form
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  typeBtnActive: { borderColor: Colors.brand.gold, backgroundColor: 'rgba(244,197,66,0.12)' },
  typeBtnText: { color: Colors.text.muted, fontWeight: '700', fontSize: 14 },
  typeBtnTextActive: { color: Colors.brand.gold },
  textInput: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', color: Colors.text.primary, fontSize: 14, padding: 12, minHeight: 72, textAlignVertical: 'top' },
  timerWrap: { gap: 6 },
  timerLabel: { color: Colors.text.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  packAssignRow: { gap: 4 },
  packChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.03)' },
  packChipActive: { borderColor: Colors.brand.gold, backgroundColor: 'rgba(255,213,96,0.12)' },
  packChipText: { color: Colors.text.muted, fontSize: 13, fontWeight: '700' },
  packChipTextActive: { color: Colors.brand.gold },
  cardMeta: { color: Colors.text.muted, fontSize: 11, fontWeight: '600' },
  addBtn: { backgroundColor: Colors.brand.purple, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: Colors.text.primary, fontWeight: '800', fontSize: 15 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  toolbarBtn: { color: Colors.text.muted, fontSize: 13, fontWeight: '700', paddingVertical: 4 },
  toolbarDanger: { color: Colors.brand.crimson },
  customCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 },
  customCardSelected: { backgroundColor: 'rgba(123,47,190,0.2)', borderWidth: 1, borderColor: Colors.brand.purpleLight + '60' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.text.muted, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: Colors.brand.purple, borderColor: Colors.brand.purple },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '800' },
  customCardBadge: { fontSize: 16, marginTop: 1 },
  customCardText: { color: Colors.text.secondary, fontSize: 13, lineHeight: 18 },
  deleteBtnText: { color: Colors.text.muted, fontSize: 14, fontWeight: '700', padding: 4 },
  emptyNote: { color: Colors.text.muted, fontSize: 13, textAlign: 'center', paddingVertical: 8, fontStyle: 'italic' },
  csvHelp: { color: Colors.text.muted, fontSize: 12, lineHeight: 18, fontFamily: 'monospace' },
  pickBtn: { marginBottom: 4 },
  orText: { color: Colors.text.muted, textAlign: 'center', fontSize: 12, marginVertical: 4 },
  csvInput: { minHeight: 100, fontFamily: 'monospace', fontSize: 12 },
  csvMsg: { fontSize: 13, fontWeight: '700', textAlign: 'center', paddingVertical: 6 },
  csvMsgOk: { color: '#6FCF4A' },
  csvMsgErr: { color: Colors.brand.crimson },
  // CSV pack name input toggle
  csvPackToggle: { paddingVertical: 8 },
  csvPackToggleText: { color: Colors.brand.neonBlue, fontSize: 13, fontWeight: '700' },
  // Prizes
  prizeGroupLabel: { color: Colors.text.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 8 },
  prizeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 10 },
  prizeText: { flex: 1, color: Colors.text.secondary, fontSize: 13, lineHeight: 18 },
  loadDefaultsBtn: { paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.brand.gold + '60', alignItems: 'center', backgroundColor: 'rgba(244,197,66,0.08)' },
  loadDefaultsText: { color: Colors.brand.gold, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
});

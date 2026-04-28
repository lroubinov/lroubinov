import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { CardType, GameRounds } from '../src/data/types';
import { Lang, tr } from '../src/i18n';
import { useGameStore } from '../src/store/gameStore';

const DURATION_OPTIONS: { value: GameRounds; labelKey: string }[] = [
  { value: 10, labelKey: 'dur10' },
  { value: 15, labelKey: 'dur15' },
  { value: 20, labelKey: 'dur20' },
  { value: null, labelKey: 'unlimitedLabel' },
];

const DURATION_LABELS: Record<string, { en: string; he: string }> = {
  dur10: { en: '10 questions', he: '10 שאלות' },
  dur15: { en: '15 questions', he: '15 שאלות' },
  dur20: { en: '20 questions', he: '20 שאלות' },
};

export default function SettingsScreen() {
  const { language, setLanguage, gameRounds, setGameRounds, customCards, addCustomCard, removeCustomCard, addCustomCards } = useGameStore();
  const t = (key: string) => tr(language, key);

  const [customText, setCustomText] = useState('');
  const [customType, setCustomType] = useState<CardType>('dare');
  const [csvText, setCsvText] = useState('');
  const [csvMessage, setCsvMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [showCsv, setShowCsv] = useState(false);

  const handleImportCsv = () => {
    const lines = csvText.trim().split('\n').filter((l) => l.trim());
    const imported: Parameters<typeof addCustomCards>[0] = [];
    let error = false;

    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 3) { error = true; break; }
      const [rawLevel, rawType, ...rest] = parts;
      const text = rest.join(',').trim();
      const level = rawLevel as 'hot' | 'scorching' | 'hardcore';
      const type = rawType as CardType;
      if (!['hot', 'scorching', 'hardcore'].includes(level)) { error = true; break; }
      if (!['truth', 'dare'].includes(type)) { error = true; break; }
      if (!text) { error = true; break; }
      imported.push({ id: `csv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, level, text });
    }

    if (error || imported.length === 0) {
      setCsvMessage({ text: t('importError'), ok: false });
      return;
    }

    addCustomCards(imported);
    setCsvText('');
    setCsvMessage({ text: `${imported.length} ${t('importSuccess')}`, ok: true });
    setTimeout(() => setCsvMessage(null), 3000);
  };

  const isRtl = language === 'he';

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
          {(['en', 'he'] as Lang[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.langBtn, language === lang && styles.langBtnActive]}
              onPress={() => setLanguage(lang)}
            >
              <Text style={[styles.langBtnText, language === lang && styles.langBtnTextActive]}>
                {lang === 'en' ? '🇺🇸  English' : '🇮🇱  עברית'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Game Duration */}
        <Text style={[styles.sectionLabel, isRtl && styles.rtl]}>{t('durationSection')}</Text>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map(({ value, labelKey }) => {
            const isActive = gameRounds === value;
            let label: string;
            if (value === null) {
              label = t('unlimitedLabel');
            } else {
              label = language === 'he'
                ? DURATION_LABELS[labelKey].he
                : DURATION_LABELS[labelKey].en;
            }
            return (
              <TouchableOpacity
                key={String(value)}
                style={[styles.durationBtn, isActive && styles.durationBtnActive]}
                onPress={() => setGameRounds(value)}
              >
                <Text style={[styles.durationBtnText, isActive && styles.durationBtnTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Questions */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowCustom((v) => !v)}>
          <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>
            {t('customSection')} {customCards.length > 0 ? `(${customCards.length})` : ''}
          </Text>
          <Text style={styles.chevron}>{showCustom ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showCustom && (
          <View style={styles.panel}>
            <View style={styles.typeRow}>
              {(['truth', 'dare'] as CardType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBtn, customType === type && styles.typeBtnActive]}
                  onPress={() => setCustomType(type)}
                >
                  <Text style={[styles.typeBtnText, customType === type && styles.typeBtnTextActive]}>
                    {type === 'truth' ? t('truthBtn') : t('dareBtn')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.textInput, isRtl && styles.rtl]}
              placeholder={customType === 'truth' ? t('writeQuestion') : t('writeDare')}
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
                addCustomCard(customText.trim(), customType);
                setCustomText('');
              }}
            >
              <Text style={styles.addBtnText}>{t('addBtn')}</Text>
            </TouchableOpacity>

            {customCards.map((c) => (
              <View key={c.id} style={styles.customCard}>
                <Text style={styles.customCardBadge}>{c.type === 'truth' ? '🔮' : '⚡'}</Text>
                <Text style={[styles.customCardText, isRtl && styles.rtl]} numberOfLines={3}>{c.text}</Text>
                <TouchableOpacity onPress={() => removeCustomCard(c.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* CSV Import */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowCsv((v) => !v)}>
          <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>{t('csvSection')}</Text>
          <Text style={styles.chevron}>{showCsv ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showCsv && (
          <View style={styles.panel}>
            <Text style={styles.csvHelp}>{t('csvHelp')}</Text>
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
            {csvMessage && (
              <Text style={[styles.csvMsg, csvMessage.ok ? styles.csvMsgOk : styles.csvMsgErr]}>
                {csvMessage.text}
              </Text>
            )}
            <GlowButton
              label={t('importBtn')}
              onPress={handleImportCsv}
              colors={['#1a3a00', '#3D7000']}
              style={styles.importBtn}
              fontSize={15}
            />
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 60,
    gap: 12,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  backText: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
  heading: {
    color: Colors.brand.gold,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
  },
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionLabel: {
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
  },
  chevron: {
    color: Colors.text.muted,
    fontSize: 12,
  },
  langRow: {
    flexDirection: 'row',
    gap: 12,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  langBtnActive: {
    borderColor: Colors.brand.gold,
    backgroundColor: 'rgba(244,197,66,0.12)',
  },
  langBtnText: {
    color: Colors.text.muted,
    fontWeight: '700',
    fontSize: 15,
  },
  langBtnTextActive: {
    color: Colors.brand.gold,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    minWidth: '46%',
    flex: 1,
    alignItems: 'center',
  },
  durationBtnActive: {
    borderColor: Colors.brand.purple,
    backgroundColor: 'rgba(123,47,190,0.2)',
  },
  durationBtnText: {
    color: Colors.text.muted,
    fontWeight: '700',
    fontSize: 14,
  },
  durationBtnTextActive: {
    color: Colors.brand.purpleLight,
  },
  panel: {
    gap: 10,
    paddingHorizontal: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: Colors.brand.gold,
    backgroundColor: 'rgba(244,197,66,0.12)',
  },
  typeBtnText: {
    color: Colors.text.muted,
    fontWeight: '700',
    fontSize: 14,
  },
  typeBtnTextActive: {
    color: Colors.brand.gold,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    color: Colors.text.primary,
    fontSize: 14,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  csvInput: {
    minHeight: 120,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: Colors.brand.purple,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: Colors.text.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  customCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
  },
  customCardBadge: {
    fontSize: 16,
    marginTop: 1,
  },
  customCardText: {
    flex: 1,
    color: Colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: Colors.text.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  csvHelp: {
    color: Colors.text.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  csvMsg: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 6,
  },
  csvMsgOk: {
    color: '#6FCF4A',
  },
  csvMsgErr: {
    color: Colors.brand.crimson,
  },
  importBtn: {
    marginTop: 4,
  },
});

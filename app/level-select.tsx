import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GlowButton from '../src/components/ui/GlowButton';
import GradientBackground from '../src/components/ui/GradientBackground';
import { Colors } from '../src/constants/colors';
import { CardType, SpiceLevel } from '../src/data/types';
import { useGameStore } from '../src/store/gameStore';

interface LevelOption {
  level: SpiceLevel;
  emoji: string;
  name: string;
  description: string;
  color: string;
  border: string;
}

const LEVELS: LevelOption[] = [
  { level: 'hot', emoji: '🌶️', name: 'Hot', description: 'Sensual & teasing — the slow burn. Flirty dares and intimate truths.', color: Colors.level.hot.bg, border: Colors.level.hot.border },
  { level: 'scorching', emoji: '💥', name: 'Scorching', description: 'Explicit — things will heat up. Bold truths, steamy dares.', color: Colors.level.scorching.bg, border: Colors.level.scorching.border },
  { level: 'hardcore', emoji: '🔥', name: 'Hardcore', description: 'No limits — for the brave. Adults only. 18+', color: Colors.level.hardcore.bg, border: Colors.level.hardcore.border },
];

export default function LevelSelectScreen() {
  const [selected, setSelected] = useState<SpiceLevel[]>(['hot']);
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customType, setCustomType] = useState<CardType>('dare');
  const { setEnabledLevels, startGame, customCards, addCustomCard, removeCustomCard } = useGameStore();

  const toggle = (level: SpiceLevel) => {
    setSelected((prev) => {
      if (prev.includes(level)) {
        const next = prev.filter((l) => l !== level);
        return next.length === 0 ? ['hot'] : next;
      }
      return [...prev, level];
    });
  };

  const handlePlay = () => {
    setEnabledLevels(selected);
    startGame();
    router.replace('/game');
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Choose Your Heat</Text>
        <Text style={styles.sub}>Mix levels for maximum fun</Text>

        {LEVELS.map((opt) => {
          const isOn = selected.includes(opt.level);
          return (
            <TouchableOpacity
              key={opt.level}
              onPress={() => toggle(opt.level)}
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: opt.color, borderColor: isOn ? opt.border : opt.border + '30' }]}
            >
              <View style={styles.cardRow}>
                <Text style={styles.emoji}>{opt.emoji}</Text>
                <View style={styles.cardText}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.levelName, { color: isOn ? Colors.text.primary : Colors.text.muted }]}>{opt.name}</Text>
                    {opt.level === 'hardcore' && <Text style={styles.badge18}>18+</Text>}
                  </View>
                  <Text style={styles.description}>{opt.description}</Text>
                </View>
                <View style={[styles.check, { borderColor: opt.border, backgroundColor: isOn ? opt.border : 'transparent' }]}>
                  {isOn && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Custom cards section */}
        <TouchableOpacity style={styles.customHeader} onPress={() => setShowCustom((v) => !v)}>
          <Text style={styles.customHeaderText}>✏️ Custom Questions {customCards.length > 0 ? `(${customCards.length})` : ''}</Text>
          <Text style={styles.customChevron}>{showCustom ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showCustom && (
          <View style={styles.customPanel}>
            {/* Type toggle */}
            <View style={styles.typeRow}>
              {(['truth', 'dare'] as CardType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, customType === t && styles.typeBtnActive]}
                  onPress={() => setCustomType(t)}
                >
                  <Text style={[styles.typeBtnText, customType === t && styles.typeBtnTextActive]}>
                    {t === 'truth' ? '🔮 Truth' : '⚡ Dare'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input */}
            <TextInput
              style={styles.input}
              placeholder={customType === 'truth' ? 'Write your truth question...' : 'Write your dare...'}
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
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>

            {/* List */}
            {customCards.map((c) => (
              <View key={c.id} style={styles.customCard}>
                <Text style={styles.customCardBadge}>{c.type === 'truth' ? '🔮' : '⚡'}</Text>
                <Text style={styles.customCardText} numberOfLines={3}>{c.text}</Text>
                <TouchableOpacity onPress={() => removeCustomCard(c.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <GlowButton label="Let's Play 🔥" onPress={handlePlay} style={styles.cta} fontSize={20} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
  heading: {
    color: Colors.brand.gold,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  sub: {
    color: Colors.text.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: -8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '800',
  },
  badge18: {
    backgroundColor: Colors.brand.crimson,
    color: Colors.text.primary,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    color: Colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: Colors.bg.deepest,
    fontWeight: '900',
    fontSize: 14,
  },
  cta: {
    marginTop: 8,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  customHeaderText: {
    color: Colors.brand.gold,
    fontSize: 15,
    fontWeight: '700',
  },
  customChevron: {
    color: Colors.text.muted,
    fontSize: 12,
  },
  customPanel: {
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
  input: {
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
});

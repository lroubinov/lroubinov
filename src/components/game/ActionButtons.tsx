import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  onDone: () => void;
  onSkip: () => void;
  skipsRemaining: number;
  skipLabel: string;
  doneLabel: string;
  noSkipsLabel: string;
  skipsLeftLabel: string;
}

export default function ActionButtons({ onDone, onSkip, skipsRemaining, doneLabel, skipLabel, noSkipsLabel, skipsLeftLabel }: Props) {
  const hasSkips = skipsRemaining > 0;

  const doneScale = useRef(new Animated.Value(0.88)).current;
  const skipScale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(doneScale, { toValue: 1, damping: 12, useNativeDriver: true }),
      Animated.spring(skipScale, { toValue: 1, damping: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const pressAnim = (anim: Animated.Value) =>
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.93, duration: 70, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, damping: 10, useNativeDriver: true }),
    ]);

  return (
    <View style={s.wrapper}>
      {/* Done — big green card */}
      <Animated.View style={[s.doneWrap, { transform: [{ scale: doneScale }] }]}>
        <TouchableOpacity
          onPress={() => { pressAnim(doneScale).start(); onDone(); }}
          activeOpacity={0.88}
          style={s.doneTouchable}
        >
          <LinearGradient
            colors={['#3ECF4C', '#27A535', '#1A8028']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.doneCard}
          >
            <View style={s.cardShine} />
            <View style={s.cardStrip} />
            <Text style={s.doneEmoji}>👍</Text>
            <Text style={[s.doneLabel, { fontFamily: 'BebasNeue_400Regular' }]}>{doneLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Skip — smaller red card */}
      <Animated.View style={[s.skipWrap, { transform: [{ scale: skipScale }] }]}>
        <TouchableOpacity
          onPress={() => { pressAnim(skipScale).start(); onSkip(); }}
          activeOpacity={0.88}
          style={s.skipTouchable}
        >
          <LinearGradient
            colors={hasSkips ? [Colors.brand.crimson, '#8B0000'] : ['#444', '#333']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.skipCard}
          >
            <View style={s.cardShine} />
            <Text style={s.skipEmoji}>👎</Text>
            <Text style={[s.skipLabel, { fontFamily: 'Exo2_700Bold' }]}>{skipLabel}</Text>
            <View style={[s.skipBadge, !hasSkips && s.skipBadgeEmpty]}>
              <Text style={s.skipBadgeText}>
                {hasSkips ? `${skipsRemaining}` : '0'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[s.skipHint, !hasSkips && s.skipHintDanger]}>
          {hasSkips ? `${skipsRemaining} ${skipsLeftLabel}` : noSkipsLabel}
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { gap: 10, paddingHorizontal: 4 },

  doneWrap: { width: '100%' },
  doneTouchable: { borderRadius: 20, overflow: 'hidden' },
  doneCard: {
    paddingVertical: 22, borderRadius: 20, alignItems: 'center', gap: 4,
    overflow: 'hidden', position: 'relative',
    shadowColor: '#27A535', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  doneEmoji: { fontSize: 32 },
  doneLabel: { color: '#fff', fontSize: 26, letterSpacing: 3, lineHeight: 30 },

  skipWrap: { alignItems: 'center', gap: 6 },
  skipTouchable: { borderRadius: 16, overflow: 'hidden', width: '65%' },
  skipCard: {
    paddingVertical: 14, borderRadius: 16, alignItems: 'center', gap: 2,
    overflow: 'hidden', position: 'relative', flexDirection: 'row',
    justifyContent: 'center', paddingHorizontal: 20,
  },
  skipEmoji: { fontSize: 20, marginRight: 8 },
  skipLabel: { color: '#fff', fontSize: 16, letterSpacing: 1 },
  skipBadge: {
    position: 'absolute', right: 12, top: '50%', marginTop: -11,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  skipBadgeEmpty: { backgroundColor: 'rgba(255,255,255,0.1)' },
  skipBadgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  skipHint: { color: Colors.text.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  skipHintDanger: { color: Colors.brand.crimson },

  cardShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.14)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  cardStrip: {
    position: 'absolute', top: 0, bottom: 0, left: 0, width: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

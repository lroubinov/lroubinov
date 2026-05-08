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

  const doneScale = useRef(new Animated.Value(0.82)).current;
  const skipScale = useRef(new Animated.Value(0.82)).current;
  const doneGlow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(doneScale, { toValue: 1, damping: 11, stiffness: 90, useNativeDriver: true }),
      Animated.spring(skipScale, { toValue: 1, damping: 11, stiffness: 90, delay: 80, useNativeDriver: true } as any),
    ]).start();

    // Subtle glow pulse on Done button
    Animated.loop(Animated.sequence([
      Animated.timing(doneGlow, { toValue: 1, duration: 1600, useNativeDriver: true }),
      Animated.timing(doneGlow, { toValue: 0, duration: 1600, useNativeDriver: true }),
    ])).start();
  }, []);

  const pressAnim = (anim: Animated.Value) =>
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.94, duration: 70, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, damping: 9, useNativeDriver: true }),
    ]);

  const glowOpacity = doneGlow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.65] });

  return (
    <View style={s.wrapper}>
      {/* Done — full-width, rose-crimson gradient, lips emoji */}
      <Animated.View style={[s.doneWrap, { transform: [{ scale: doneScale }] }]}>
        {/* Outer glow ring */}
        <Animated.View style={[s.doneGlowRing, { opacity: glowOpacity }]} />
        <TouchableOpacity
          onPress={() => { pressAnim(doneScale).start(); onDone(); }}
          activeOpacity={0.88}
          style={s.doneTouchable}
        >
          <LinearGradient
            colors={['#C2005A', '#E8256A', '#FF4FA3']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.doneCard}
          >
            <View style={s.doneShine} />
            <View style={s.doneRow}>
              <Text style={s.doneEmoji}>💋</Text>
              <Text style={[s.doneLabel, { fontFamily: 'BebasNeue_400Regular' }]}>{doneLabel}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Skip — narrower pill, dark with rose border */}
      <Animated.View style={[s.skipWrap, { transform: [{ scale: skipScale }] }]}>
        <TouchableOpacity
          onPress={() => { pressAnim(skipScale).start(); onSkip(); }}
          activeOpacity={0.85}
          style={s.skipTouchable}
        >
          <LinearGradient
            colors={hasSkips ? ['rgba(40,10,30,0.95)', 'rgba(60,10,40,0.95)'] : ['rgba(30,30,40,0.95)', 'rgba(40,30,50,0.95)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[s.skipCard, { borderColor: hasSkips ? Colors.brand.neonPink + '50' : 'rgba(255,255,255,0.12)' }]}
          >
            <Text style={s.skipEmoji}>{hasSkips ? '🖤' : '💔'}</Text>
            <Text style={[s.skipLabel, { fontFamily: 'Exo2_700Bold' }]}>{skipLabel}</Text>
            {/* Skip count badge */}
            <View style={[s.badge, hasSkips ? s.badgeActive : s.badgeEmpty]}>
              <Text style={[s.badgeText, !hasSkips && s.badgeTextEmpty]}>{skipsRemaining}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Hint text */}
        <Text style={[s.hint, !hasSkips && s.hintDanger]}>
          {hasSkips
            ? `${skipsRemaining} ${skipsLeftLabel}`
            : noSkipsLabel}
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { gap: 12, paddingHorizontal: 4 },

  // Done
  doneWrap: { width: '100%', position: 'relative' },
  doneGlowRing: {
    position: 'absolute',
    inset: -4,
    borderRadius: 28,
    backgroundColor: 'rgba(232,37,106,0.22)',
    zIndex: 0,
  } as any,
  doneTouchable: { borderRadius: 24, overflow: 'hidden', zIndex: 1 },
  doneCard: {
    paddingVertical: 20, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  doneShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneEmoji: { fontSize: 28 },
  doneLabel: { color: '#fff', fontSize: 28, letterSpacing: 3, lineHeight: 32 },

  // Skip
  skipWrap: { alignItems: 'center', gap: 6 },
  skipTouchable: { borderRadius: 22, overflow: 'hidden', width: '65%' },
  skipCard: {
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderWidth: 1.5, position: 'relative',
  },
  skipEmoji: { fontSize: 20 },
  skipLabel: { color: Colors.text.secondary, fontSize: 16, letterSpacing: 0.5 },
  badge: {
    position: 'absolute', right: 12, top: '50%', marginTop: -12,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeActive: { backgroundColor: Colors.brand.neonPink + '30', borderWidth: 1, borderColor: Colors.brand.neonPink + '60' },
  badgeEmpty:  { backgroundColor: 'rgba(255,255,255,0.08)' },
  badgeText:      { color: Colors.brand.neonPink, fontSize: 11, fontWeight: '900' },
  badgeTextEmpty: { color: Colors.text.muted },

  hint:        { color: Colors.text.muted,   fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  hintDanger:  { color: Colors.brand.crimson },
});

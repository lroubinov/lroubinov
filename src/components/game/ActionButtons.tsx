import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
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
  const doneScale = useRef(new Animated.Value(0.9)).current;
  const skipScale = useRef(new Animated.Value(0.95)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(-260)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(doneScale, { toValue: 1, damping: 9, stiffness: 90, useNativeDriver: true }),
      Animated.spring(skipScale, { toValue: 1, damping: 10, stiffness: 80, delay: 80, useNativeDriver: true } as any),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1500, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 420, duration: 1800, useNativeDriver: true }),
      Animated.delay(1100),
      Animated.timing(shimmer, { toValue: -260, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);

  const press = (anim: Animated.Value, cb: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 75, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, damping: 8, stiffness: 160, useNativeDriver: true }),
    ]).start(cb);
  };

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.7] });

  return (
    <View style={s.wrapper}>
      <Animated.View style={[s.doneWrap, { transform: [{ scale: doneScale }] }]}>
        <Animated.View style={[s.doneAura, { opacity: glowOpacity }]} />
        <TouchableOpacity activeOpacity={0.9} onPress={() => press(doneScale, onDone)} style={s.doneTouch}>
          <LinearGradient
            colors={['#FF2D78', '#C2005A', '#FF6A00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.doneCard}
          >
            <View style={s.glassShine} />
            <Animated.View style={[s.shimmer, { transform: [{ translateX: shimmer }, { skewX: '-18deg' }] }]} />
            <Text style={s.doneSmall}>♡ completed the challenge ♡</Text>
            <View style={s.doneRow}>
              <Text style={s.doneEmoji}>💋</Text>
              <Text style={s.doneText}>{doneLabel}</Text>
              <Text style={s.doneEmoji}>🔥</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[s.skipWrap, { transform: [{ scale: skipScale }] }]}>
        <TouchableOpacity activeOpacity={0.86} onPress={() => press(skipScale, onSkip)} style={s.skipTouch}>
          <LinearGradient
            colors={hasSkips ? ['rgba(44,8,32,0.96)', 'rgba(18,8,28,0.96)'] : ['rgba(32,32,42,0.96)', 'rgba(16,14,24,0.96)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.skipCard, { borderColor: hasSkips ? Colors.brand.neonPink + '88' : 'rgba(255,255,255,0.14)' }]}
          >
            <Text style={s.skipIcon}>{hasSkips ? '🖤' : '💔'}</Text>
            <View style={s.skipTextWrap}>
              <Text style={s.skipText}>{skipLabel}</Text>
              <Text style={[s.skipHint, !hasSkips && s.skipHintDanger]}>
                {hasSkips ? `${skipsRemaining} ${skipsLeftLabel}` : noSkipsLabel}
              </Text>
            </View>
            <View style={[s.badge, hasSkips ? s.badgeActive : s.badgeOff]}>
              <Text style={[s.badgeText, !hasSkips && s.badgeTextOff]}>{skipsRemaining}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { gap: 13, paddingHorizontal: 4, paddingTop: 6 },
  doneWrap: { position: 'relative' },
  doneAura: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 6,
    bottom: -6,
    borderRadius: 30,
    backgroundColor: 'rgba(255,45,120,0.38)',
  },
  doneTouch: { borderRadius: 28, overflow: 'hidden' },
  doneCard: {
    minHeight: 86,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 70, backgroundColor: 'rgba(255,255,255,0.18)' },
  doneSmall: { color: 'rgba(255,255,255,0.76)', fontSize: 10, fontWeight: '800', letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 2 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneEmoji: { fontSize: 25 },
  doneText: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 8 },
  skipWrap: { alignItems: 'center' },
  skipTouch: { borderRadius: 24, overflow: 'hidden', width: '82%' },
  skipCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  skipIcon: { fontSize: 22 },
  skipTextWrap: { flex: 1 },
  skipText: { color: Colors.text.secondary, fontSize: 17, fontWeight: '900', letterSpacing: 0.4 },
  skipHint: { color: Colors.text.muted, fontSize: 10, fontWeight: '700', marginTop: 2 },
  skipHintDanger: { color: Colors.brand.crimson },
  badge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  badgeActive: { backgroundColor: Colors.brand.neonPink + '24', borderColor: Colors.brand.neonPink + '80' },
  badgeOff: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' },
  badgeText: { color: Colors.brand.neonPink, fontSize: 13, fontWeight: '900' },
  badgeTextOff: { color: Colors.text.muted },
});

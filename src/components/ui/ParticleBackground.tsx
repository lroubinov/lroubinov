import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ParticleConfig {
  color: string;
  size: number;
  left: number;   // percentage 0–100
  duration: number;
  delay: number;
}

const DEFAULT_PARTICLES: ParticleConfig[] = [
  { color: '#FF4500', size: 3, left: 15, duration: 8000,  delay: 0    },
  { color: '#FF7A00', size: 4, left: 30, duration: 10000, delay: 1500 },
  { color: '#FFD560', size: 2, left: 50, duration: 7000,  delay: 3000 },
  { color: '#FF2D5A', size: 3, left: 70, duration: 9000,  delay: 800  },
  { color: '#3DD6F5', size: 2, left: 85, duration: 11000, delay: 4000 },
  { color: '#FF4500', size: 2, left: 5,  duration: 8500,  delay: 2000 },
  { color: '#FF7A00', size: 3, left: 55, duration: 9500,  delay: 5000 },
  { color: '#FF2D5A', size: 2, left: 42, duration: 7500,  delay: 3500 },
];

function Particle({ color, size, left, duration, delay }: ParticleConfig) {
  const y       = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, { toValue: -750, duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.9, duration: duration * 0.1, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.6, duration: duration * 0.8, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0,   duration: duration * 0.1, useNativeDriver: true }),
          ]),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: `${left}%` as any,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOpacity: 0.9,
        shadowRadius: size * 2,
        shadowOffset: { width: 0, height: 0 },
        transform: [{ translateY: y }],
        opacity,
      }}
    />
  );
}

interface Props {
  particles?: ParticleConfig[];
}

export default function ParticleBackground({ particles = DEFAULT_PARTICLES }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </View>
  );
}

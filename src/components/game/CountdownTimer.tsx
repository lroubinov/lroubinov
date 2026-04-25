import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface Props {
  seconds: number;
  onComplete: () => void;
}

const SIZE = 120;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownTimer({ seconds, onComplete }: Props) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (timeLeft <= 0) {
      onCompleteRef.current();
      return;
    }
    const id = setTimeout(() => {
      setTimeLeft((t) => t - 1);
      if (timeLeft <= 6) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  const progress = timeLeft / seconds;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const timerColor =
    timeLeft > 10 ? Colors.brand.gold : timeLeft > 5 ? '#FF8C00' : Colors.brand.crimson;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.bg.surface}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={timerColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.center}>
          <Text style={[styles.number, { color: timerColor }]}>{timeLeft}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
    marginVertical: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 32,
    fontWeight: '900',
  },
});

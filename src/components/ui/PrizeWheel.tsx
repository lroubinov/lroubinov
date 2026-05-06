import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

const RADIUS = 130;
const CX = RADIUS + 10;
const CY = RADIUS + 10;
const SIZE = (RADIUS + 10) * 2;

const SEGMENT_COLORS = [
  ['#E84040', '#C02020'],
  ['#FF8500', '#C05A00'],
  ['#7B2FBE', '#4E0F99'],
  ['#E040A0', '#A01060'],
  ['#2FBEC8', '#0A7880'],
  ['#F4C542', '#B88A00'],
  ['#3ECF4C', '#1A8028'],
  ['#FF6B35', '#C03000'],
  ['#8B5CF6', '#5B21B6'],
  ['#EC4899', '#9D174D'],
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end   = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

interface Props {
  prizes: string[];
  spinLabel: string;
  onComplete: (prize: string) => void;
}

export default function PrizeWheel({ prizes, spinLabel, onComplete }: Props) {
  const n = prizes.length;
  const segAngle = 360 / n;
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [totalRot, setTotalRot] = useState(0);

  const spin = () => {
    if (spinning || n === 0) return;
    setSpinning(true);
    const winnerIdx = Math.floor(Math.random() * n);
    // Angle of winning segment center from 0 (top)
    const segCenter = winnerIdx * segAngle + segAngle / 2;
    // We need the wheel to rotate so segCenter lands at the top (0deg pointer)
    // The segment at position idx starts at idx * segAngle and the pointer is at the top
    const offset = 360 - segCenter;
    const spins = 5 * 360;
    const target = totalRot + spins + offset - ((totalRot + offset) % 360);

    Animated.timing(rotation, {
      toValue: target,
      duration: 3800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setTotalRot(target % 360);
      onComplete(prizes[winnerIdx]);
    });
  };

  const rotateStr = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  if (n === 0) return null;

  return (
    <View style={s.container}>
      {/* Arrow indicator */}
      <View style={s.arrow}>
        <Text style={s.arrowText}>▼</Text>
      </View>

      {/* Wheel */}
      <Animated.View style={{ transform: [{ rotate: rotateStr }] }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {prizes.map((prize, i) => {
            const startAngle = i * segAngle;
            const endAngle   = startAngle + segAngle;
            const midAngle   = startAngle + segAngle / 2;
            const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length][0];
            const textR = RADIUS * 0.62;
            const tp = polarToCartesian(CX, CY, textR, midAngle);
            const truncated = prize.length > 14 ? prize.slice(0, 13) + '…' : prize;
            return (
              <G key={i}>
                <Path
                  d={arcPath(CX, CY, RADIUS, startAngle, endAngle)}
                  fill={color}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={1}
                />
                <SvgText
                  x={tp.x}
                  y={tp.y}
                  fill="#fff"
                  fontSize={n > 10 ? 8 : 10}
                  fontWeight="700"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  rotation={midAngle - 90}
                  originX={tp.x}
                  originY={tp.y}
                >
                  {truncated}
                </SvgText>
              </G>
            );
          })}
          {/* Center circle */}
          <Path
            d={`M ${CX} ${CY} m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0`}
            fill="#1A0020"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.5}
          />
        </Svg>
      </Animated.View>

      {/* Spin button */}
      <TouchableOpacity onPress={spin} disabled={spinning} activeOpacity={0.85} style={s.spinWrap}>
        <LinearGradient
          colors={spinning ? ['#444', '#333'] : ['#FF8500', '#E63000']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.spinBtn}
        >
          <Text style={[s.spinText, { fontFamily: 'BebasNeue_400Regular' }]}>{spinLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', gap: 12 },
  arrow: { zIndex: 10 },
  arrowText: { color: '#FFD700', fontSize: 24, textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  spinWrap: { borderRadius: 22, overflow: 'hidden', width: 160 },
  spinBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 22 },
  spinText: { color: '#fff', fontSize: 26, letterSpacing: 4 },
});

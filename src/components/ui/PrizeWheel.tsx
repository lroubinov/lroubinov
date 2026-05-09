import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { Sounds } from '../../utils/sounds';

const DEFAULT_RADIUS = 130;

const SEGMENT_COLORS = [
  '#E84040', '#FF8500', '#7B2FBE', '#E040A0', '#2FBEC8',
  '#F4C542', '#3ECF4C', '#FF6B35', '#8B5CF6', '#EC4899',
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

export interface PrizeWheelRef {
  spin: () => void;
  isSpinning: boolean;
}

interface Props {
  prizes: string[];
  onComplete: (prize: string) => void;
  onSpinStart?: () => void;
  radius?: number;
}

const PrizeWheel = forwardRef<PrizeWheelRef, Props>(({ prizes, onComplete, onSpinStart, radius: radiusProp }, ref) => {
  const RADIUS = radiusProp ?? DEFAULT_RADIUS;
  const CX = RADIUS + 10;
  const CY = RADIUS + 10;
  const SIZE = (RADIUS + 10) * 2;

  const n = prizes.length;
  const segAngle = 360 / n;
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const currentRotRef = useRef(0);
  const spinningRef = useRef(false);

  const spin = () => {
    if (spinningRef.current || n === 0) return;
    spinningRef.current = true;
    setSpinning(true);
    onSpinStart?.();

    const winnerIdx = Math.floor(Math.random() * n);
    const segCenter = winnerIdx * segAngle + segAngle / 2;
    const offset = 360 - segCenter;
    const base = currentRotRef.current;
    const spins = 5 * 360;
    const remainder = ((offset - (base % 360)) + 360) % 360;
    const target = base + spins + remainder;

    Sounds.playWheelSpin();

    Animated.timing(rotation, {
      toValue: target,
      duration: 3800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      Sounds.stopWheelSpin();
      Sounds.playDing();
      spinningRef.current = false;
      setSpinning(false);
      currentRotRef.current = target;
      onComplete(prizes[winnerIdx]);
    });
  };

  useImperativeHandle(ref, () => ({ spin, isSpinning: spinning }));

  // Flick gesture on wheel → triggers spin
  const flickPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !spinningRef.current,
      onMoveShouldSetPanResponder: (_, g) => !spinningRef.current && (Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8),
      onPanResponderRelease: (_, g) => {
        const speed = Math.sqrt(g.vx * g.vx + g.vy * g.vy);
        if (speed > 0.25) spin();
      },
    })
  ).current;

  const rotateStr = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  if (n === 0) return null;

  return (
    <View {...flickPan.panHandlers}>
      <Animated.View style={{ transform: [{ rotate: rotateStr }] }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {prizes.map((prize, i) => {
            const startAngle = i * segAngle;
            const endAngle   = startAngle + segAngle;
            const midAngle   = startAngle + segAngle / 2;
            const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
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
          <Path
            d={`M ${CX} ${CY} m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0`}
            fill="#1A0020"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.5}
          />
        </Svg>
      </Animated.View>
    </View>
  );
});

PrizeWheel.displayName = 'PrizeWheel';
export default PrizeWheel;

export const s = StyleSheet.create({});

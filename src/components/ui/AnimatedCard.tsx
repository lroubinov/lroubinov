import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

export interface AnimatedCardRef {
  flip: () => void;
  reset: () => void;
}

interface Props {
  frontContent: React.ReactNode;
  onFlipComplete?: () => void;
}

const AnimatedCard = forwardRef<AnimatedCardRef, Props>(({ frontContent, onFlipComplete }, ref) => {
  const rotation = useSharedValue(0);

  const onComplete = onFlipComplete;

  useImperativeHandle(ref, () => ({
    flip: () => {
      rotation.value = withTiming(1, { duration: 400 }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      });
    },
    reset: () => {
      rotation.value = 0;
    },
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [-180, 0])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  return (
    <View style={styles.container}>
      {/* Back face */}
      <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>
        <LinearGradient colors={Colors.gradient.card} style={styles.card}>
          <Text style={styles.backLogo}>🔥</Text>
          <Text style={styles.backTitle}>IGNITE</Text>
          <Text style={styles.backSub}>Your night. Your rules.</Text>
        </LinearGradient>
      </Animated.View>

      {/* Front face */}
      <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
        <LinearGradient colors={Colors.gradient.card} style={styles.card}>
          {frontContent}
        </LinearGradient>
      </Animated.View>
    </View>
  );
});

AnimatedCard.displayName = 'AnimatedCard';
export default AnimatedCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 260,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.brand.purpleLight + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLogo: {
    fontSize: 48,
    marginBottom: 8,
  },
  backTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.brand.gold,
    letterSpacing: 6,
  },
  backSub: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

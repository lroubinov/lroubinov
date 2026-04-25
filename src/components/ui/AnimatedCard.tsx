import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
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
  const rotation = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    flip: () => {
      Animated.timing(rotation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onFlipComplete) onFlipComplete();
      });
    },
    reset: () => {
      rotation.setValue(0);
    },
  }));

  const backRotateY = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotateY = rotation.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ perspective: 1000 }, { rotateY: backRotateY }], backfaceVisibility: 'hidden' }]}>
        <LinearGradient colors={Colors.gradient.card} style={styles.card}>
          <Text style={styles.backLogo}>🔥</Text>
          <Text style={styles.backTitle}>IGNITE</Text>
          <Text style={styles.backSub}>Your night. Your rules.</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ perspective: 1000 }, { rotateY: frontRotateY }], backfaceVisibility: 'hidden' }]}>
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
  backLogo: { fontSize: 48, marginBottom: 8 },
  backTitle: { fontSize: 32, fontWeight: '900', color: Colors.brand.gold, letterSpacing: 6 },
  backSub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, fontStyle: 'italic' },
});

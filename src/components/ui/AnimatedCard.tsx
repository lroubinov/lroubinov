import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
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
  const rotation  = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.72)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    flip: () => {
      // Spring zoom in + cubic bezier flip simultaneously
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, damping: 13, stiffness: 140, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 520,
          easing: Easing.bezier(0.23, 1.0, 0.32, 1.0),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && onFlipComplete) onFlipComplete();
      });
    },
    reset: () => {
      rotation.setValue(0);
      cardScale.setValue(0.72);
      cardOpacity.setValue(0);
    },
  }));

  const backRotateY  = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotateY = rotation.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>
      {/* Back face */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ perspective: 2000 }, { rotateY: backRotateY }], backfaceVisibility: 'hidden' }]}>
        <LinearGradient colors={['rgba(255,133,0,0.18)', 'rgba(255,69,0,0.08)']} style={[styles.card, styles.backCard]}>
          <View style={styles.backShine} />
          <View style={styles.backStrip} />
          <Text style={styles.backLogo}>🔥</Text>
          <Text style={[styles.backTitle, { fontFamily: 'BebasNeue_400Regular' }]}>IGNITE</Text>
          <Text style={[styles.backSub, { fontFamily: 'Exo2_700Bold' }]}>Your night. Your rules.</Text>
        </LinearGradient>
      </Animated.View>

      {/* Front face */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ perspective: 2000 }, { rotateY: frontRotateY }], backfaceVisibility: 'hidden' }]}>
        <LinearGradient colors={Colors.gradient.card} style={[styles.card, styles.frontCard]}>
          {frontContent}
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
});

AnimatedCard.displayName = 'AnimatedCard';
export default AnimatedCard;

const styles = StyleSheet.create({
  container: { width: '100%', minHeight: 300, flex: 1 },
  card: {
    flex: 1, borderRadius: 22, padding: 20,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  backCard: {
    borderColor: Colors.brand.fire + '55',
    shadowColor: Colors.brand.fire, shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 6 },
  },
  frontCard: { borderColor: Colors.brand.purpleLight + '40' },
  backShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.07)', borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  backStrip: {
    position: 'absolute', top: 0, bottom: 0, left: 0, width: 3,
    backgroundColor: Colors.brand.fire, opacity: 0.7,
  },
  backLogo:  { fontSize: 52, marginBottom: 8 },
  backTitle: { fontSize: 40, color: Colors.brand.gold, letterSpacing: 7, lineHeight: 44 },
  backSub:   { fontSize: 13, color: Colors.text.muted, marginTop: 6, letterSpacing: 1 },
});

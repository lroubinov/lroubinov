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
        <LinearGradient colors={['rgba(255,133,0,0.14)', 'rgba(255,69,0,0.06)']} style={[styles.card, styles.backCard]}>
          <View style={styles.backShine} />
          <Text style={styles.backLogo}>🔥</Text>
          <Text style={[styles.backTitle, { fontFamily: 'BebasNeue_400Regular' }]}>IGNITE</Text>
          <Text style={[styles.backSub, { fontFamily: 'Exo2_700Bold' }]}>Your night. Your rules.</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ perspective: 1000 }, { rotateY: frontRotateY }], backfaceVisibility: 'hidden' }]}>
        <LinearGradient colors={Colors.gradient.card} style={[styles.card, styles.frontCard]}>
          {frontContent}
        </LinearGradient>
      </Animated.View>
    </View>
  );
});

AnimatedCard.displayName = 'AnimatedCard';
export default AnimatedCard;

const styles = StyleSheet.create({
  container: { width: '100%', height: 260 },
  card: {
    flex: 1, borderRadius: 20, padding: 24,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  backCard: {
    borderColor: Colors.brand.fire + '55',
    shadowColor: Colors.brand.fire, shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
  },
  frontCard: { borderColor: Colors.brand.purpleLight + '40' },
  backShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.06)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  backLogo:  { fontSize: 48, marginBottom: 6 },
  backTitle: { fontSize: 36, color: Colors.brand.gold, letterSpacing: 6, lineHeight: 40 },
  backSub:   { fontSize: 13, color: Colors.text.muted, marginTop: 4 },
});

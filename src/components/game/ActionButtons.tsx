import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import GlowButton from '../ui/GlowButton';

interface Props {
  onDone: () => void;
  onSkip: () => void;
  skipsRemaining: number;
  skipLabel: string;
  doneLabel: string;
  noSkipsLabel: string;
  skipsLeftLabel: string;
}

export default function ActionButtons({ onDone, onSkip, skipsRemaining, skipLabel, doneLabel, noSkipsLabel, skipsLeftLabel }: Props) {
  const hasSkips = skipsRemaining > 0;
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <GlowButton
          label={doneLabel}
          onPress={onDone}
          colors={Colors.gradient.button.done}
          style={styles.btn}
          fontSize={16}
        />
        <GlowButton
          label={skipLabel}
          onPress={onSkip}
          colors={Colors.gradient.button.skip}
          style={styles.btn}
          fontSize={16}
        />
      </View>
      <Text style={[styles.skipsHint, !hasSkips && styles.noSkips]}>
        {hasSkips ? `${skipsRemaining} ${skipsLeftLabel}` : noSkipsLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
  },
  skipsHint: {
    color: Colors.text.muted,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  noSkips: {
    color: Colors.brand.crimson,
  },
});

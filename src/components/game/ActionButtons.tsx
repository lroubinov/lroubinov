import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/colors';
import GlowButton from '../ui/GlowButton';

interface Props {
  onDone: () => void;
  onSkip: () => void;
}

export default function ActionButtons({ onDone, onSkip }: Props) {
  return (
    <View style={styles.row}>
      <GlowButton
        label="Done ✓"
        onPress={onDone}
        colors={Colors.gradient.button.done}
        style={styles.btn}
        fontSize={16}
      />
      <GlowButton
        label="Skip →"
        onPress={onSkip}
        colors={Colors.gradient.button.skip}
        style={styles.btn}
        fontSize={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  btn: {
    flex: 1,
  },
});

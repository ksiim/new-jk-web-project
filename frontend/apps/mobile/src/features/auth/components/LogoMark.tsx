import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';

/** Маркер из макета: пин + «глаз» в центре */
export function LogoMark({ size = 56 }: { size?: number }) {
  const inner = Math.round(size * 0.32);
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Ionicons name="location-sharp" size={size} color={colors.accentDark} />
      <View style={[styles.badge, { width: inner + 8, height: inner + 8, top: size * 0.18 }]}>
        <Ionicons name="eye" size={inner} color={colors.background} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

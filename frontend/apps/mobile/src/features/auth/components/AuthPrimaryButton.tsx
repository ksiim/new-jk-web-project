import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../../shared/theme/colors';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AuthPrimaryButton({ title, onPress, loading, disabled }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      style={[styles.btn, inactive && styles.btnDisabled]}
      onPress={onPress}
      disabled={inactive}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.accentButton,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

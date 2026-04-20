import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary';
};

export function Button({ title, variant = 'primary', style, ...props }: Props) {
  return (
    <Pressable
      {...props}
      style={[
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        style as never,
      ]}
    >
      <Text style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#111827',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryText: {
    color: '#111827',
    fontWeight: '700',
  },
});


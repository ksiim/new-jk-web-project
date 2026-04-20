import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: number;
};

function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function Avatar({ uri, name, size = 80 }: Props) {
  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
  } as const;

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, style]} />;
  }

  return (
    <View style={[styles.placeholder, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.line,
  },
  placeholder: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: '700',
  },
});

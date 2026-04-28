import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  shape?: 'circle' | 'rounded';
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

export function Avatar({
  uri,
  name,
  size = 80,
  width,
  height,
  radius,
  shape = 'circle',
}: Props) {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;
  const resolvedRadius = radius ?? (shape === 'circle' ? resolvedWidth / 2 : 12);
  const style = {
    width: resolvedWidth,
    height: resolvedHeight,
    borderRadius: resolvedRadius,
  } as const;

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, style]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.placeholder, style]}>
      <Text style={[styles.initials, { fontSize: Math.min(resolvedWidth, resolvedHeight) * 0.38 }]}>
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

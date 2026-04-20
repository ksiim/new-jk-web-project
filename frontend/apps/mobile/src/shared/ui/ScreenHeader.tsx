import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

type Props = {
  /** По умолчанию «Назад». Передай null, если кнопка не нужна. */
  label?: string | null;
  /** Переопределить поведение (по умолчанию — navigation.goBack()). */
  onBack?: () => void;
};

export function ScreenHeader({ label = 'Назад', onBack }: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const topInset = Math.max(insets.top, 8);

  if (label === null) {
    return <View style={[styles.spacer, { paddingTop: topInset }]} />;
  }

  return (
    <View style={[styles.wrap, { paddingTop: topInset }]}>
      <Pressable onPress={handlePress} hitSlop={10} style={styles.back}>
        <Feather name="chevron-left" size={22} color={colors.textPrimary} />
        <Text style={styles.backText}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 12,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  spacer: {
    height: 24,
  },
});

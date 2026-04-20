import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { LogoMark } from '../../features/auth/components/LogoMark';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingComplete'>;

export function OnboardingCompleteScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const startExploring = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <View
      style={[
        styles.flex,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <View style={styles.hero}>
        <LogoMark size={96} />
        <Text style={styles.title}>Готово!</Text>
        <Text style={styles.subtitle}>Мы подобрали для вас уникальный опыт</Text>
      </View>

      <Pressable style={styles.cta} onPress={startExploring}>
        <Text style={styles.ctaText}>Начать исследовать</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: colors.welcomeCta,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignSelf: 'center',
    minWidth: 220,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

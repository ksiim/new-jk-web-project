import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../entities/auth/authStore';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const setHasSeenWelcome = useAuthStore((s) => s.setHasSeenWelcome);

  const onStart = () => {
    setHasSeenWelcome(true);
    navigation.navigate('Register');
  };

  const onLogin = () => {
    setHasSeenWelcome(true);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#9AAC99', '#5D6B58', '#4A5648']}
        style={styles.hero}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <View style={styles.decorRow}>
          <Text style={styles.decorDot}>·</Text>
          <Text style={styles.decorLine}>········</Text>
          <Text style={styles.decorIcon}>☕</Text>
          <Text style={styles.decorLine}>········</Text>
          <Text style={styles.decorIcon}>📍</Text>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.headline}>Открой город по-новому</Text>
          <Text style={styles.subline}>
            Персональные маршруты и уникальные впечатления
          </Text>
        </View>

        <Pressable style={styles.cta} onPress={onStart}>
          <Text style={styles.ctaText}>Начать</Text>
        </Pressable>
      </LinearGradient>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.footerText}>
          Уже есть аккаунт?{' '}
          <Text style={styles.footerLink} onPress={onLogin}>
            Войти
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  decorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
  decorDot: {
    color: colors.white,
    fontSize: 28,
    marginRight: 4,
  },
  decorLine: {
    color: colors.white,
    letterSpacing: 2,
    fontSize: 12,
  },
  decorIcon: {
    fontSize: 18,
    marginHorizontal: 6,
  },
  textBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 34,
    textShadowColor: colors.overlayDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subline: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
    opacity: 0.95,
    textShadowColor: colors.overlayDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cta: {
    alignSelf: 'center',
    backgroundColor: colors.welcomeCta,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: colors.background,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  footerLink: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

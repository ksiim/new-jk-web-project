import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from 'react-native';
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
      <View style={styles.hero}>
        <Image
          source={require('../../../assets/welcome-bg.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.55, 1]}
          style={[StyleSheet.absoluteFill, styles.heroGradient]}
        />

        <View style={[styles.heroContent, { paddingTop: insets.top + 32 }]}>
          <View style={styles.textBlock}>
            <Text style={styles.headline}>Открой город по-новому</Text>
            <Text style={styles.subline}>
              Персональные маршруты и уникальные впечатления
            </Text>
          </View>

          <Pressable style={styles.cta} onPress={onStart}>
            <Text style={styles.ctaText}>Начать</Text>
          </Pressable>
        </View>
      </View>

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
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    pointerEvents: 'none',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'flex-end',
  },
  textBlock: {
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 34,
    ...(Platform.OS === 'web'
      ? ({ textShadow: '0 2px 8px rgba(0,0,0,0.55)' } as TextStyle)
      : {
          textShadowColor: 'rgba(0,0,0,0.55)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 8,
        }),
  },
  subline: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
    opacity: 0.95,
    ...(Platform.OS === 'web'
      ? ({ textShadow: '0 1px 6px rgba(0,0,0,0.55)' } as TextStyle)
      : {
          textShadowColor: 'rgba(0,0,0,0.55)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 6,
        }),
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

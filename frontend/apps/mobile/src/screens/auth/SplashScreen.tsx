import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../entities/auth/authStore';
import { LogoMark } from '../../features/auth/components/LogoMark';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const MIN_SPLASH_MS = 1200;

export function SplashScreen({ navigation }: Props) {
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSeenWelcome = useAuthStore((s) => s.hasSeenWelcome);

  useEffect(() => {
    if (!_hasHydrated) return;

    const id = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Main');
      } else if (!hasSeenWelcome) {
        navigation.replace('Welcome');
      } else {
        navigation.replace('Login');
      }
    }, MIN_SPLASH_MS);

    return () => clearTimeout(id);
  }, [_hasHydrated, isAuthenticated, hasSeenWelcome, navigation]);

  return (
    <View style={styles.root}>
      <LogoMark size={64} />
      <Text style={styles.title}>Местный Взгляд</Text>
      <ActivityIndicator size="large" color={colors.textPrimary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  loader: {
    marginTop: 48,
  },
});

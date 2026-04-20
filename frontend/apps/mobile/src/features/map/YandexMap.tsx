import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../shared/theme/colors';
import type { YandexMapProps } from './YandexMap.types';

/**
 * Заглушка для нативных платформ. Будет заменена на `react-native-yamap`
 * после `expo prebuild` и подключения MapKit-ключа (этап B).
 */
export function YandexMap({ places }: YandexMapProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Нативная карта скоро появится</Text>
      <Text style={styles.subtitle}>
        В dev-сборке подключим MapKit Яндекса. Пока места берите из списка ниже.
      </Text>
      <Text style={styles.count}>Найдено мест: {places.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 240,
    backgroundColor: '#EFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  count: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { routes } from '../entities/routes/mockData';
import type { MainStackParamList } from '../navigation/MainNavigator';
import { colors } from '../shared/theme/colors';

export function RoutesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Text style={styles.searchText}>Поиск</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Готовые маршруты</Text>
        <Text style={styles.chevron}>˅</Text>
      </View>

      <Text style={styles.subTitle}>Для вас</Text>

      {routes.map((route) => (
        <View key={route.id} style={styles.routeCard}>
          <Text style={[styles.status, { color: route.status === 'active' ? '#8FD588' : '#D596D5' }]}>
            ● {route.status === 'active' ? 'Сейчас активен' : 'В планах'}
          </Text>
          <Text style={styles.routeTitle}>{route.title}</Text>
          <Text style={styles.routeMeta}>
            {route.distanceKm} км • {route.durationHours} часа
            {route.status === 'planned' ? ` • ${route.pace}` : ''}
          </Text>

          <Pressable
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('ActiveRoute')}
          >
            <Text style={styles.outlineBtnText}>
              {route.status === 'active' ? 'Продолжить' : 'Начать'}
            </Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.subTitle}>Популярные</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  searchRow: { paddingTop: 12 },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  searchText: { color: '#7A8494', fontSize: 16 },
  sectionHeader: {
    marginTop: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 34, color: colors.textPrimary, fontWeight: '800' },
  chevron: { color: colors.textPrimary, fontSize: 22 },
  subTitle: {
    marginTop: 8,
    marginBottom: 8,
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: '800',
  },
  routeCard: { marginBottom: 12 },
  status: { fontSize: 13 },
  routeTitle: {
    marginTop: 4,
    fontSize: 38,
    color: colors.textPrimary,
    fontWeight: '700',
    lineHeight: 44,
  },
  routeMeta: { marginTop: 2, color: colors.textMuted, fontSize: 20 },
  outlineBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  outlineBtnText: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
});


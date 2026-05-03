import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { usePoes } from '../../entities/poe/hooks';
import { useActiveRouteStore } from '../../entities/route/activeRouteStore';
import { useRouteHistoryStore } from '../../entities/route/routeHistoryStore';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';

export function ActiveRouteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useActiveRouteStore((s) => s.route);
  const setRoute = useActiveRouteStore((s) => s.setRoute);
  const updateRoute = useRouteHistoryStore((s) => s.updateRoute);
  const [search, setSearch] = useState('');
  const [selectedPoeId, setSelectedPoeId] = useState<string | null>(null);
  const poes = usePoes({ city_id: 'ekb', page: 1, limit: 100 });

  const poeById = useMemo(() => {
    const map = new Map<string, { title: string; category: string; address: string | null }>();
    (poes.data?.data ?? []).forEach((item) => {
      map.set(item.id, {
        title: item.title,
        category: item.category,
        address: item.location.address,
      });
    });
    return map;
  }, [poes.data?.data]);

  const visiblePoints = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return route?.points ?? [];
    return (route?.points ?? []).filter((point) => {
      const poe = poeById.get(point.poe_id);
      const haystack = `${point.poe_id} ${poe?.title ?? ''} ${poe?.address ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [poeById, route?.points, search]);

  if (!route) {
    return (
      <View style={styles.root}>
        <ScreenHeader />
        <View style={styles.content}>
          <Text style={styles.emptyTitle}>Маршрут не выбран</Text>
          <Text style={styles.emptyBody}>
            Сначала сгенерируйте маршрут на вкладке «Маршруты».
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader />
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск по названию или адресу"
          placeholderTextColor={styles.searchText.color}
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.routeTitle}>{route.title}</Text>
          <Text style={styles.chevron}>˅</Text>
        </View>
        <Text style={styles.routeMeta}>
          {(route.distance_meters / 1000).toFixed(1)} км •{' '}
          {Math.round(route.duration_minutes / 60)} ч • {route.pace}
        </Text>

        <Text style={styles.listTitle}>Список точек маршрута:</Text>

        {visiblePoints.map((point, index) => {
          const poe = poeById.get(point.poe_id);
          const title = poe?.title ?? point.poe_id;
          const category = poe?.category ?? 'sight';
          const icon =
            category.includes('museum') || category.includes('culture')
              ? '🏛️'
              : category.includes('park') || category.includes('nature')
                ? '🌳'
                : category.includes('architecture')
                  ? '🏰'
                  : '📍';

          return (
            <Pressable
              key={`${point.poe_id}-${point.order}-${index}`}
              style={[styles.pointRow, selectedPoeId === point.poe_id && styles.pointRowSelected]}
              onPress={() => {
                setSelectedPoeId(point.poe_id);
                navigation.navigate('PoeDetail', { poeId: point.poe_id });
              }}
            >
              <View style={styles.pointTextWrap}>
                <Text style={styles.pointIndex}>
                  {index + 1}. {title}
                </Text>
                <Text style={styles.pointSub}>
                  Остановка: {point.planned_stop_minutes} мин
                </Text>
                {poe?.address ? (
                  <Text numberOfLines={1} style={styles.pointAddress}>
                    {poe.address}
                  </Text>
                ) : null}
              </View>
              <View style={styles.pointImage}>
                <Text style={styles.pointImageIcon}>{icon}</Text>
                <Text numberOfLines={1} style={styles.pointImageTitle}>
                  {title}
                </Text>
                <Text style={styles.pointRating}>#{index + 1}</Text>
              </View>
            </Pressable>
          );
        })}
        {!visiblePoints.length ? (
          <Text style={styles.emptyBody}>По вашему запросу точки не найдены.</Text>
        ) : null}

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            updateRoute({ ...route, status: 'in_progress' });
            navigation.goBack();
          }}
        >
          <Text style={styles.primaryButtonText}>Приостановить</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButton, styles.secondaryButton]}
          onPress={() => {
            updateRoute({ ...route, status: 'completed' });
            setRoute(null);
            navigation.navigate('Tabs');
          }}
        >
          <Text style={styles.primaryButtonText}>Завершить</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  searchText: {
    color: '#7A8494',
    fontSize: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    fontSize: 30,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  chevron: {
    fontSize: 26,
    color: colors.textPrimary,
  },
  listTitle: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 16,
  },
  routeMeta: {
    marginBottom: 12,
    color: colors.textMuted,
    fontSize: 13,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
    borderRadius: 8,
    padding: 4,
  },
  pointRowSelected: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pointTextWrap: {
    flex: 1,
  },
  pointIndex: {
    fontSize: 17,
    color: '#5C6470',
    lineHeight: 24,
  },
  pointSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  pointAddress: {
    marginTop: 2,
    color: colors.textSubtle,
    fontSize: 11,
  },
  pointImage: {
    width: 140,
    height: 74,
    borderRadius: 6,
    backgroundColor: '#7C8378',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 8,
    borderWidth: 1,
    borderColor: '#98A093',
  },
  pointImageIcon: {
    fontSize: 16,
  },
  pointImageTitle: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.95,
  },
  pointRating: {
    color: colors.white,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
  primaryButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: colors.accentButton,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    minWidth: 190,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 10,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
});

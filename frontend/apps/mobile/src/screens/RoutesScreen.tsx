import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { usePreferencesStore } from '../entities/preferences/preferencesStore';
import { usePoes } from '../entities/poe/hooks';
import { useActiveRouteStore } from '../entities/route/activeRouteStore';
import { useRouteHistoryStore } from '../entities/route/routeHistoryStore';
import { useRouteDraftStore } from '../entities/route/routeDraftStore';
import { useGenerateRoute } from '../entities/route/hooks';
import { EKATERINBURG_CENTER } from '../entities/place/places';
import type { MainStackParamList } from '../navigation/MainNavigator';
import { extractApiError } from '../shared/api/http';
import { colors } from '../shared/theme/colors';
import { SaveButton } from '../shared/ui/SaveButton';

function routeStatusLabel(status: string) {
  const map: Record<string, string> = {
    draft: 'черновик',
    saved: 'сохранен',
    in_progress: 'в пути',
    completed: 'завершен',
    archived: 'архив',
  };
  return map[status] ?? status;
}

export function RoutesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const interests = usePreferencesStore((s) => s.interests);
  const accessibility = usePreferencesStore((s) => s.accessibility);
  const tempo = usePreferencesStore((s) => s.tempo);
  const durationMinHours = usePreferencesStore((s) => s.durationMinHours);
  const durationMaxHours = usePreferencesStore((s) => s.durationMaxHours);
  const budgetMax = usePreferencesStore((s) => s.budgetMax);
  const setActiveRoute = useActiveRouteStore((s) => s.setRoute);
  const activeRoute = useActiveRouteStore((s) => s.route);
  const routeHistory = useRouteHistoryStore((s) => s.routes);
  const addRouteToHistory = useRouteHistoryStore((s) => s.addRoute);
  const draftPoeIds = useRouteDraftStore((s) => s.poeIds);
  const clearDraftRoute = useRouteDraftStore((s) => s.clear);
  const poeCatalog = usePoes({ city_id: 'ekb', page: 1, limit: 100 });
  const generate = useGenerateRoute();

  const generateFromPrefs = async () => {
    const avgHours = Math.max(
      1,
      Math.round(
        ((durationMinHours ?? 1) + (durationMaxHours ?? durationMinHours ?? 1)) / 2,
      ),
    );
    const budgetLevel =
      budgetMax === null ? 'medium' : budgetMax <= 3000 ? 'low' : budgetMax <= 8000 ? 'medium' : 'high';
    const pace = tempo ?? 'medium';
    const draftTagSet = new Set<string>();
    const selectedDraftPoes = (poeCatalog.data?.data ?? []).filter((poe) => draftPoeIds.includes(poe.id));
    for (const poe of selectedDraftPoes) {
      for (const tag of poe.tags) {
        draftTagSet.add(tag);
      }
    }
    const mergedInterests = Array.from(new Set([...interests, ...Array.from(draftTagSet)]));

    const payload = {
      city_id: 'ekb',
      interests: mergedInterests,
      start_location: {
        lat: EKATERINBURG_CENTER.lat,
        lng: EKATERINBURG_CENTER.lng,
        address: 'Екатеринбург, центр',
      },
      duration_minutes: avgHours * 60,
      pace,
      budget_level: budgetLevel,
      accessibility: {
        wheelchair_required: accessibility.includes('wheelchair'),
        avoid_stairs: accessibility.includes('avoid_stairs'),
        need_rest_points: accessibility.includes('cane'),
      },
    };

    try {
      const route = await generate.mutateAsync(payload);
      const savedRoute = { ...route, status: 'saved' as const };
      setActiveRoute(savedRoute);
      addRouteToHistory(savedRoute);
      navigation.navigate('ActiveRoute');
      return;
    } catch (error) {
      const firstError = extractApiError(error);
      const canRelax =
        firstError.includes('No POE candidates') ||
        firstError.includes('POE candidates') ||
        firstError.includes('не найдено');

      if (!canRelax) {
        console.warn('Route generation failed', firstError);
        return;
      }

      // Fallback pass: relax filters to increase chance of route generation.
      try {
        const relaxedRoute = await generate.mutateAsync({
          ...payload,
          interests: [],
          duration_minutes: Math.max(payload.duration_minutes, 180),
          accessibility: {
            wheelchair_required: false,
            avoid_stairs: false,
            need_rest_points: false,
          },
        });
        const savedRelaxedRoute = { ...relaxedRoute, status: 'saved' as const };
        setActiveRoute(savedRelaxedRoute);
        addRouteToHistory(savedRelaxedRoute);
        navigation.navigate('ActiveRoute');
      } catch (relaxedError) {
        console.warn('Route generation failed after relaxed fallback', extractApiError(relaxedError));
      }
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Text style={styles.searchText}>Поиск</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Маршруты</Text>
        <Text style={styles.chevron}>˅</Text>
      </View>

      <View style={styles.generatorCard}>
        <Text style={styles.generatorTitle}>Сгенерировать маршрут</Text>
        <Text style={styles.generatorMeta}>
          На основе интересов, доступности и времени из вашего профиля.
        </Text>
        {draftPoeIds.length > 0 ? (
          <View style={styles.draftRow}>
            <Text style={styles.draftMeta}>Добавлено точек из карты: {draftPoeIds.length}</Text>
            <Pressable onPress={clearDraftRoute}>
              <Text style={styles.clearText}>Очистить</Text>
            </Pressable>
          </View>
        ) : null}
        <SaveButton
          title="Сгенерировать"
          onPress={generateFromPrefs}
          loading={generate.isPending}
        />
        {generate.isError ? (
          <Text style={styles.errorText}>{extractApiError(generate.error)}</Text>
        ) : null}
      </View>

      <Text style={styles.subTitle}>Текущий маршрут</Text>
      {activeRoute ? (
        <View style={styles.routeCard}>
          <Text style={[styles.status, { color: '#8FD588' }]}>● Сейчас активен</Text>
          <Text style={styles.routeTitle}>{activeRoute.title}</Text>
          <Text style={styles.routeMeta}>
            {(activeRoute.distance_meters / 1000).toFixed(1)} км •{' '}
            {Math.round(activeRoute.duration_minutes / 60)} ч • {activeRoute.pace}
          </Text>
          <Pressable style={styles.outlineBtn} onPress={() => navigation.navigate('ActiveRoute')}>
            <Text style={styles.outlineBtnText}>Открыть</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.emptyText}>Пока нет сгенерированного маршрута</Text>
      )}

      <Text style={styles.subTitle}>Мои маршруты</Text>
      {routeHistory.length === 0 ? (
        <Text style={styles.emptyText}>История маршрутов пока пуста</Text>
      ) : (
        routeHistory.map((route) => (
          <Pressable
            key={route.id}
            style={styles.historyCard}
            onPress={() => {
              setActiveRoute(route);
              navigation.navigate('ActiveRoute');
            }}
          >
            <Text style={styles.historyTitle}>{route.title}</Text>
            <Text style={styles.historyMeta}>
              {(route.distance_meters / 1000).toFixed(1)} км • {Math.round(route.duration_minutes / 60)} ч • {route.points.length} точек
            </Text>
            <Text style={styles.historyStatus}>{routeStatusLabel(route.status)}</Text>
          </Pressable>
        ))
      )}
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
  generatorCard: {
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    gap: 8,
  },
  generatorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  generatorMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  draftRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  draftMeta: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  clearText: {
    color: colors.errorText,
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: colors.errorText,
    fontSize: 12,
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
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 12,
  },
  historyCard: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  historyTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  historyMeta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  historyStatus: {
    marginTop: 4,
    color: colors.successText,
    fontSize: 12,
    fontWeight: '700',
  },
});

import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { usePreferencesStore } from '../entities/preferences/preferencesStore';
import { usePoeDetail, usePoes } from '../entities/poe/hooks';
import { poeToPlace } from '../entities/poe/mappers';
import { usePoeFavouritesStore, usePoeFiltersStore } from '../entities/poe/poeUiStore';
import { useRouteDraftStore } from '../entities/route/routeDraftStore';
import { YandexMap } from '../features/map/YandexMap';
import {
  formatDurationHours,
  formatPriceRange,
  recommendPlaces,
} from '../features/recommendations/recommend';
import type { MainStackParamList } from '../navigation/MainNavigator';
import { extractApiError } from '../shared/api/http';
import { colors } from '../shared/theme/colors';

export function MapScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const interests = usePreferencesStore((s) => s.interests);
  const accessibility = usePreferencesStore((s) => s.accessibility);
  const tempo = usePreferencesStore((s) => s.tempo);
  const budgetMin = usePreferencesStore((s) => s.budgetMin);
  const budgetMax = usePreferencesStore((s) => s.budgetMax);
  const durationMinHours = usePreferencesStore((s) => s.durationMinHours);
  const durationMaxHours = usePreferencesStore((s) => s.durationMaxHours);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCategory = usePoeFiltersStore((s) => s.category);
  const wheelchairOnly = usePoeFiltersStore((s) => s.wheelchairOnly);
  const avoidStairsOnly = usePoeFiltersStore((s) => s.avoidStairs);
  const radiusMeters = usePoeFiltersStore((s) => s.radiusMeters);
  const favouriteIds = usePoeFavouritesStore((s) => s.favouriteIds);
  const toggleFavourite = usePoeFavouritesStore((s) => s.toggleFavourite);
  const addRoutePoint = useRouteDraftStore((s) => s.addPoint);
  const hasRoutePoint = useRouteDraftStore((s) => s.hasPoint);

  const tagFilter = interests.join(',');
  const poeQuery = useMemo(
    () => ({
      city_id: 'ekb',
      category: selectedCategory ?? undefined,
      tags: tagFilter || undefined,
      wheelchair_accessible:
        wheelchairOnly || accessibility.includes('wheelchair') ? true : undefined,
      avoid_stairs:
        avoidStairsOnly || accessibility.includes('avoid_stairs') ? true : undefined,
      radius: radiusMeters ?? undefined,
      lat: 56.8389,
      lng: 60.6057,
      page: 1,
      limit: 100,
    }),
    [
      tagFilter,
      selectedCategory,
      wheelchairOnly,
      avoidStairsOnly,
      accessibility,
      radiusMeters,
    ],
  );
  const poeList = usePoes(poeQuery);
  const selectedPoe = usePoeDetail(selectedId);

  const sourcePlaces = useMemo(() => {
    if (poeList.data?.data?.length) {
      return poeList.data.data.map(poeToPlace);
    }
    return [];
  }, [poeList.data?.data]);

  const recommendations = useMemo(() => {
    const base = recommendPlaces(sourcePlaces, {
      interests,
      accessibility,
      tempo,
      budgetMin,
      budgetMax,
      durationMinHours,
      durationMaxHours,
    });

    const q = query.trim().toLowerCase();
    if (!q) return base;
    return {
      ...base,
      items: base.items.filter(
        ({ place }) =>
          place.name.toLowerCase().includes(q) ||
          place.description.toLowerCase().includes(q) ||
          place.address.toLowerCase().includes(q),
      ),
    };
  }, [
    sourcePlaces,
    interests,
    accessibility,
    tempo,
    budgetMin,
    budgetMax,
    durationMinHours,
    durationMaxHours,
    query,
  ]);

  const placesForMap = useMemo(
    () => recommendations.items.map((item) => item.place),
    [recommendations],
  );

  const loadingInitial = poeList.isLoading && sourcePlaces.length === 0;
  const apiErrorText = poeList.isError ? extractApiError(poeList.error) : null;

  return (
    <View style={styles.root}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Поиск по местам"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <Pressable
          style={styles.filterBtn}
          onPress={() => navigation.navigate('MapFilters')}
        >
          <Feather name="sliders" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.mapWrap}>
        {loadingInitial ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={colors.textPrimary} />
            <Text style={styles.stateText}>Загружаем точки на карте...</Text>
          </View>
        ) : (
          <YandexMap
            places={placesForMap}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </View>

      <View style={styles.listWrap}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {recommendations.items.length > 0
              ? `Рекомендуем: ${recommendations.items.length}`
              : 'Ничего не подошло'}
          </Text>
          {recommendations.relaxed ? (
            <Text style={[styles.listHint, styles.listHintWarn]}>
              фильтры сняты — подходящих мест не нашлось
            </Text>
          ) : interests.length > 0 || accessibility.length > 0 ? (
            <Text style={styles.listHint}>на основе ваших предпочтений</Text>
          ) : null}
        </View>
        {apiErrorText ? (
          <View style={styles.apiHintWrap}>
            <Text style={styles.apiHintTitle}>
              API POE временно недоступен.
            </Text>
            <Text style={styles.apiHintBody}>{apiErrorText}</Text>
          </View>
        ) : null}

        <FlatList
          horizontal
          data={recommendations.items}
          keyExtractor={(item) => item.place.id}
          contentContainerStyle={styles.listContent}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Ничего не найдено</Text>
              <Text style={styles.emptyHint}>
                Попробуйте смягчить фильтры или обновить ответы онбординга.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const { place } = item;
            const isSelected = place.id === selectedId;
            return (
              <Pressable
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelectedId(place.id)}
              >
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={styles.cardAddress} numberOfLines={1}>
                  {place.address}
                </Text>
                <View style={styles.cardMetaRow}>
                  <View style={styles.metaBadge}>
                    <Feather name="clock" size={12} color={colors.textPrimary} />
                    <Text style={styles.metaText}>
                      {formatDurationHours(place.durationHours)}
                    </Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Feather
                      name="credit-card"
                      size={12}
                      color={colors.textPrimary}
                    />
                    <Text style={styles.metaText}>{formatPriceRange(place)}</Text>
                  </View>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {selectedPoe.data?.id === place.id
                    ? selectedPoe.data.description
                    : place.description}
                </Text>
                <View style={styles.actionsRow}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('PoeDetail', { poeId: place.id })}
                  >
                    <Feather name="info" size={13} color={colors.textPrimary} />
                    <Text style={styles.actionBtnText}>Подробнее</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.actionBtn,
                      favouriteIds.includes(place.id) && styles.actionBtnActive,
                    ]}
                    onPress={() => toggleFavourite(place.id)}
                  >
                    <Feather
                      name={favouriteIds.includes(place.id) ? 'heart' : 'heart'}
                      size={13}
                      color={
                        favouriteIds.includes(place.id) ? colors.white : colors.textPrimary
                      }
                    />
                    <Text
                      style={[
                        styles.actionBtnText,
                        favouriteIds.includes(place.id) && styles.actionBtnTextActive,
                      ]}
                    >
                      Избранное
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, hasRoutePoint(place.id) && styles.routeAddedBtn]}
                    onPress={() => addRoutePoint(place.id)}
                  >
                    <Feather
                      name="plus-circle"
                      size={13}
                      color={hasRoutePoint(place.id) ? colors.white : colors.textPrimary}
                    />
                    <Text
                      style={[
                        styles.actionBtnText,
                        hasRoutePoint(place.id) && styles.actionBtnTextActive,
                      ]}
                    >
                      {hasRoutePoint(place.id) ? 'Добавлено' : 'В маршрут'}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  mapWrap: {
    flex: 1,
    backgroundColor: '#EFE9DF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  listWrap: {
    backgroundColor: colors.white,
    paddingTop: 12,
    paddingBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  listHintWarn: {
    color: '#C45C5C',
  },
  listContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  apiHintWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  apiHintTitle: {
    color: colors.errorText,
    fontSize: 12,
    fontWeight: '700',
  },
  apiHintBody: {
    marginTop: 2,
    color: colors.errorText,
    fontSize: 11,
  },
  card: {
    width: 240,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.white,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardAddress: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metaText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  cardDescription: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.white,
  },
  actionBtnActive: {
    borderColor: colors.accentButton,
    backgroundColor: colors.accentButton,
  },
  routeAddedBtn: {
    borderColor: colors.accentButton,
    backgroundColor: colors.accentButton,
  },
  actionBtnText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionBtnTextActive: {
    color: colors.white,
  },
  emptyCard: {
    width: 260,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyHint: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
});

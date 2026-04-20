import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { demoPlaces } from '../entities/place/places';
import { usePreferencesStore } from '../entities/preferences/preferencesStore';
import { YandexMap } from '../features/map/YandexMap';
import {
  formatDurationHours,
  formatPriceRange,
  recommendPlaces,
} from '../features/recommendations/recommend';
import type { MainStackParamList } from '../navigation/MainNavigator';
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

  const recommendations = useMemo(() => {
    const base = recommendPlaces(demoPlaces, {
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
        <YandexMap
          places={placesForMap}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
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
                  {place.description}
                </Text>
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

import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTours } from '../entities/tour/hooks';
import type { MainStackParamList } from '../navigation/MainNavigator';
import { extractApiError } from '../shared/api/http';
import { colors } from '../shared/theme/colors';

export function ToursScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const tours = useTours({ city_id: 'ekb', page: 1, limit: 50 });
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'list' | 'map'>('list');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = tours.data?.data ?? [];
    if (!q) return items;
    return items.filter((item) =>
      `${item.title} ${item.guide.name}`.toLowerCase().includes(q),
    );
  }, [query, tours.data?.data]);

  if (tours.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (tours.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Туры</Text>
        <Text style={styles.errorText}>{extractApiError(tours.error)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Туры</Text>
      <View style={styles.searchWrap}>
        <Feather name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        <Feather name="sliders" size={18} color={colors.textPrimary} />
      </View>
      <View style={styles.segment}>
        <Pressable
          style={[styles.segmentBtn, tab === 'list' && styles.segmentBtnActive]}
          onPress={() => setTab('list')}
        >
          <Text style={[styles.segmentText, tab === 'list' && styles.segmentTextActive]}>Список</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentBtn, tab === 'map' && styles.segmentBtnActive]}
          onPress={() => setTab('map')}
        >
          <Text style={[styles.segmentText, tab === 'map' && styles.segmentTextActive]}>Карта</Text>
        </Pressable>
      </View>
      {tab === 'map' ? (
        <View style={styles.mapMock}>
          <Text style={styles.mapLabel}>Екатеринбург</Text>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.pin, { top: 70 + i * 78, left: 80 + i * 40 }]} />
          ))}
        </View>
      ) : null}
      {tab === 'list' ? (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.cover_image_url ? (
              <Image source={{ uri: item.cover_image_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Feather name="image" size={20} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.ratingPill}>
              <Text style={styles.ratingPillText}>★ {item.rating.toFixed(1)} ({item.reviews_count})</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.meta}>
              👤 {item.guide.name} ({item.guide.reviews_count} чел.)
            </Text>
            <Text style={styles.meta}>
              Сегодня в 16:00 ({Math.round(item.duration_minutes / 60)} часа)
            </Text>
            <Text style={styles.price}>
              {item.price.amount.toLocaleString('ru-RU')} руб.
            </Text>
            <Pressable
              style={styles.moreBtn}
              onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
            >
              <Text style={styles.moreBtnText}>Подробнее</Text>
            </Pressable>
          </View>
        )}
      />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  searchWrap: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 16, paddingVertical: 0 },
  segment: {
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: colors.accentButton },
  segmentText: { color: colors.textPrimary, fontWeight: '600' },
  segmentTextActive: { color: colors.white },
  mapMock: {
    height: 290,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#F7F7F2',
    marginBottom: 12,
  },
  mapLabel: { margin: 10, color: colors.textPrimary, fontWeight: '700' },
  pin: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D3342A',
    borderWidth: 2,
    borderColor: colors.white,
  },
  errorText: { marginTop: 8, fontSize: 14, color: colors.errorText },
  listContent: { paddingBottom: 20, gap: 12 },
  row: { gap: 12 },
  card: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 8,
  },
  cover: {
    width: '100%',
    height: 84,
    borderRadius: 8,
    backgroundColor: colors.backgroundMuted,
  },
  ratingPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.overlayCard,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingPillText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 18,
    color: colors.textPrimary,
    fontWeight: '700',
    minHeight: 36,
  },
  meta: { marginTop: 4, fontSize: 12, color: colors.textMuted },
  price: { marginTop: 4, fontSize: 16, color: colors.textPrimary, fontWeight: '800' },
  moreBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  moreBtnText: { color: colors.textPrimary, fontWeight: '600' },
});


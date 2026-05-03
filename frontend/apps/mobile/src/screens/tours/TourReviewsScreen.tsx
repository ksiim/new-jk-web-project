import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTourReviews } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { extractApiError } from '../../shared/api/http';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'TourReviews'>;

export function TourReviewsScreen({ route }: Props) {
  const { tourId } = route.params;
  const reviews = useTourReviews(tourId);

  const avgRating = (() => {
    const items = reviews.data?.data ?? [];
    if (!items.length) return null;
    return items.reduce((sum, item) => sum + item.rating, 0) / items.length;
  })();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <Text style={styles.title}>Отзывы о туре</Text>
      <Text style={styles.score}>
        {avgRating ? `⭐ ${avgRating.toFixed(1)} (${reviews.data?.data.length ?? 0} оценок)` : 'Пока без оценок'}
      </Text>

      {reviews.isLoading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : null}
      {reviews.isError ? (
        <Text style={styles.errorText}>{extractApiError(reviews.error)}</Text>
      ) : null}
      {(reviews.data?.data.length ?? 0) === 0 && !reviews.isLoading ? (
        <Text style={styles.emptyText}>Отзывов пока нет</Text>
      ) : null}
      {(reviews.data?.data ?? []).map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>Оценка: {item.rating}/5</Text>
          <Text style={styles.body}>{item.text}</Text>
          <Text style={styles.meta}>Дата: {new Date(item.created_at).toLocaleDateString('ru-RU')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  title: { marginTop: 8, color: colors.textPrimary, fontWeight: '800', fontSize: 24, lineHeight: 38 },
  score: { marginTop: 8, color: colors.textPrimary, fontSize: 20 / 1.2, fontWeight: '700' },
  card: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
  },
  cardTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 18 / 1.15 },
  body: { marginTop: 6, color: colors.textPrimary, fontSize: 17 / 1.2, lineHeight: 24 },
  meta: { marginTop: 8, color: colors.textMuted, fontSize: 12 },
  errorText: { marginTop: 12, color: colors.errorText, fontSize: 12 },
  emptyText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
});

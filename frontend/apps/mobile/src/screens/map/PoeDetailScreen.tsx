import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createPoeReview } from '../../entities/poe/api';
import { usePoeDetail } from '../../entities/poe/hooks';
import { usePoeFavouritesStore } from '../../entities/poe/poeUiStore';
import { useRouteDraftStore } from '../../entities/route/routeDraftStore';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { extractApiError } from '../../shared/api/http';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { Stars } from '../../shared/ui/Stars';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'PoeDetail'>;

export function PoeDetailScreen({ route }: Props) {
  const { poeId } = route.params;
  const detail = usePoeDetail(poeId);
  const favouriteIds = usePoeFavouritesStore((s) => s.favouriteIds);
  const toggleFavourite = usePoeFavouritesStore((s) => s.toggleFavourite);
  const addRoutePoint = useRouteDraftStore((s) => s.addPoint);
  const hasRoutePoint = useRouteDraftStore((s) => s.hasPoint);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);

  const review = useMutation({
    mutationFn: async () =>
      createPoeReview(poeId, {
        rating,
        text: reviewText.trim(),
      }),
    onSuccess: () => {
      setReviewText('');
      setInlineError(null);
    },
    onError: (error) => {
      setInlineError(extractApiError(error));
    },
  });

  const image = useMemo(() => detail.data?.images?.[0], [detail.data?.images]);

  if (detail.isLoading) {
    return (
      <View style={styles.rootLoading}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <View style={styles.rootLoading}>
        <Text style={styles.errorTitle}>Не удалось загрузить карточку POE</Text>
        <Text style={styles.errorBody}>{extractApiError(detail.error)}</Text>
      </View>
    );
  }

  const poe = detail.data;
  const isFav = favouriteIds.includes(poe.id);
  const isInRoute = hasRoutePoint(poe.id);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader />
        {image ? (
          <Image source={{ uri: image }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Feather name="image" size={30} color={colors.textMuted} />
          </View>
        )}
        <Text style={styles.title}>{poe.title}</Text>
        <Text style={styles.meta}>{poe.location.address ?? 'Адрес не указан'}</Text>
        <View style={styles.ratingRow}>
          <Stars value={poe.rating} />
          <Text style={styles.meta}>
            {poe.rating.toFixed(1)} ({poe.reviews_count})
          </Text>
        </View>
        <Text style={styles.description}>{poe.description}</Text>

        <View style={styles.tagsWrap}>
          {poe.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.accessWrap}>
          <Text style={styles.blockTitle}>Доступность</Text>
          <Text style={styles.meta}>
            {poe.accessibility.wheelchair_accessible ? '✓ Коляска' : '— Нет условий для коляски'}
          </Text>
          <Text style={styles.meta}>{poe.accessibility.has_ramp ? '✓ Есть пандус' : '— Пандуса нет'}</Text>
          <Text style={styles.meta}>{poe.accessibility.has_stairs ? '⚠ Есть лестницы' : '✓ Без лестниц'}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, isFav && styles.actionBtnPrimary]}
            onPress={() => toggleFavourite(poe.id)}
          >
            <Text style={[styles.actionText, isFav && styles.actionTextPrimary]}>
              {isFav ? 'В избранном' : 'В избранное'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, isInRoute && styles.actionBtnPrimary]}
            onPress={() => addRoutePoint(poe.id)}
          >
            <Text style={[styles.actionText, isInRoute && styles.actionTextPrimary]}>
              {isInRoute ? 'В маршруте' : 'В маршрут'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.reviewBlock}>
          <Text style={styles.blockTitle}>Оставить отзыв</Text>
          <View style={styles.scoreRow}>
            {[1, 2, 3, 4, 5].map((v) => (
              <Pressable key={v} onPress={() => setRating(v)} hitSlop={4}>
                <Feather
                  name="star"
                  size={20}
                  color={v <= rating ? colors.starYellow : colors.lineSoft}
                />
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            placeholder="Ваш отзыв"
            placeholderTextColor={colors.textMuted}
          />
          {inlineError ? <Text style={styles.inlineError}>{inlineError}</Text> : null}
          <SaveButton
            title="Отправить отзыв"
            onPress={() => review.mutate()}
            disabled={!reviewText.trim()}
            loading={review.isPending}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  rootLoading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 28 },
  hero: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  heroPlaceholder: {
    backgroundColor: colors.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  meta: { marginTop: 4, fontSize: 13, color: colors.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  description: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  tagsWrap: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tagText: { fontSize: 12, color: colors.textPrimary },
  accessWrap: { marginTop: 14, gap: 2 },
  blockTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  actionsRow: { marginTop: 14, flexDirection: 'row', gap: 10 },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  actionBtnPrimary: {
    borderColor: colors.accentButton,
    backgroundColor: colors.accentButton,
  },
  actionText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  actionTextPrimary: { color: colors.white },
  reviewBlock: { marginTop: 18, gap: 10 },
  scoreRow: { flexDirection: 'row', gap: 6 },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 10,
    minHeight: 90,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  inlineError: { color: colors.errorText, fontSize: 12, marginTop: -4 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  errorBody: { marginTop: 4, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});

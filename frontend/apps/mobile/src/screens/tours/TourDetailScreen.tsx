import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Modal,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useCreateTourReview, useTour } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { extractApiError } from '../../shared/api/http';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'TourDetail'>;

export function TourDetailScreen({ route, navigation }: Props) {
  const { tourId, bookingId } = route.params;
  const tour = useTour(tourId);
  const queryClient = useQueryClient();
  const createReview = useCreateTourReview();
  const [fav, setFav] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState('5');

  if (tour.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }
  if (tour.isError || !tour.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{extractApiError(tour.error)}</Text>
      </View>
    );
  }

  const canSubmitReview = Boolean(bookingId && reviewText.trim().length >= 8 && Number(reviewRating) >= 1 && Number(reviewRating) <= 5);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <View style={styles.heroWrap}>
        {tour.data.images[0] || tour.data.guide.avatar_url ? (
          <Image source={{ uri: tour.data.images[0] ?? (tour.data.guide.avatar_url as string) }} style={styles.hero} />
        ) : (
          <View style={[styles.hero, styles.heroPh]} />
        )}
        <Pressable style={styles.fav} onPress={() => setFav((v) => !v)}>
          <Text style={styles.favText}>{fav ? '♥' : '♡'}</Text>
        </Pressable>
        <Text style={styles.heroPrice}>{tour.data.price.amount.toLocaleString('ru-RU')} руб.</Text>
      </View>

      <Text style={styles.title}>{tour.data.title}</Text>
      <Text style={styles.description}>{tour.data.description}</Text>

      <Pressable style={styles.metaRow} onPress={() => navigation.navigate('GuideProfile', { tourId })}>
        <Feather name="user" size={16} color={colors.textPrimary} />
        <Text style={styles.meta}>{tour.data.guide.name} - локальный художник</Text>
      </Pressable>
      <View style={styles.metaRow}>
        <Feather name="users" size={16} color={colors.textPrimary} />
        <Text style={styles.meta}>Группы до {tour.data.group_size_max} человек</Text>
      </View>
      <View style={styles.metaRow}>
        <Feather name="clock" size={16} color={colors.textPrimary} />
        <Text style={styles.meta}>{Math.round(tour.data.duration_minutes / 60)} часа, каждый четверг в 18:00</Text>
      </View>
      <View style={styles.metaRow}>
        <Feather name="map-pin" size={16} color={colors.textPrimary} />
        <Text style={styles.meta}>{tour.data.meeting_point.address ?? 'Начало в центре города'}</Text>
      </View>
      <Pressable style={styles.metaRow} onPress={() => navigation.navigate('TourReviews', { tourId })}>
        <Feather name="star" size={16} color={colors.starYellow} />
        <Text style={styles.meta}>{tour.data.rating.toFixed(1)} ({tour.data.reviews_count} отзывов)</Text>
      </Pressable>
      {bookingId ? (
        <Pressable style={styles.reviewBtn} onPress={() => setReviewOpen(true)}>
          <Text style={styles.reviewBtnText}>Оставить отзыв по брони</Text>
        </Pressable>
      ) : null}

      <Text style={styles.blockTitle}>Доступность:</Text>
      <Text style={styles.accItem}>{tour.data.accessibility.wheelchair_accessible ? '✓' : '✕'} пандус</Text>
      <Text style={styles.accItem}>{tour.data.accessibility.avoid_stairs_possible ? '✓' : '✕'} широкие проходы</Text>
      <Text style={styles.accItem}>{tour.data.accessibility.avoid_stairs_possible ? '✓' : '✕'} ступени</Text>

      <Pressable style={styles.bookBtn} onPress={() => navigation.navigate('TourBooking', { tourId })}>
        <Text style={styles.bookBtnText}>Забронировать</Text>
      </Pressable>

      <Modal visible={reviewOpen} transparent animationType="fade" onRequestClose={() => setReviewOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setReviewOpen(false)}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Новый отзыв</Text>
            <TextInput
              value={reviewRating}
              onChangeText={(value) => setReviewRating(value.replace(/[^0-9]/g, '').slice(0, 1))}
              keyboardType="number-pad"
              placeholder="Оценка 1..5"
              style={styles.modalInput}
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Опишите впечатления от тура"
              style={[styles.modalInput, styles.modalTextarea]}
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <Pressable
              style={[styles.modalSubmit, (!canSubmitReview || createReview.isPending) && styles.disabledBtn]}
              disabled={!canSubmitReview || createReview.isPending}
              onPress={async () => {
                if (!bookingId) return;
                await createReview.mutateAsync({
                  tourId,
                  bookingId,
                  rating: Number(reviewRating),
                  text: reviewText.trim(),
                });
                await queryClient.invalidateQueries({ queryKey: ['tours', 'detail', tourId] });
                await queryClient.invalidateQueries({ queryKey: ['tours', 'reviews', tourId] });
                setReviewOpen(false);
                setReviewText('');
                setReviewRating('5');
              }}
            >
              <Text style={styles.modalSubmitText}>Отправить отзыв</Text>
            </Pressable>
            {createReview.isError ? (
              <Text style={styles.errorText}>{extractApiError(createReview.error)}</Text>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroWrap: { marginTop: 6, position: 'relative' },
  hero: { width: '100%', height: 150, borderRadius: 14, backgroundColor: colors.line },
  heroPh: { backgroundColor: '#798172' },
  fav: { position: 'absolute', right: 12, top: 10 },
  favText: { color: colors.white, fontSize: 24, fontWeight: '700' },
  heroPrice: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  title: { marginTop: 14, fontSize: 38 / 2, fontWeight: '800', color: colors.textPrimary },
  metaRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { color: colors.textPrimary, fontSize: 18 / 1.2, textDecorationLine: 'underline' },
  description: { marginTop: 10, fontSize: 20 / 1.2, color: colors.textPrimary, lineHeight: 30 },
  blockTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 34 / 2,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  accItem: { color: colors.textPrimary, fontSize: 18 / 1.2, marginBottom: 8 },
  reviewBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  reviewBtnText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  bookBtn: {
    marginTop: 12,
    alignSelf: 'center',
    minWidth: 230,
    backgroundColor: colors.accentButton,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookBtnText: { color: colors.white, fontSize: 34 / 2, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  modalTextarea: { minHeight: 88, textAlignVertical: 'top' },
  modalSubmit: {
    marginTop: 4,
    backgroundColor: colors.accentButton,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalSubmitText: { color: colors.white, fontWeight: '700' },
  disabledBtn: { opacity: 0.5 },
  errorText: { color: colors.errorText, fontSize: 12, marginBottom: 8 },
});

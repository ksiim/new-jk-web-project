import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTour } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { extractApiError } from '../../shared/api/http';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'TourDetail'>;

export function TourDetailScreen({ route, navigation }: Props) {
  const { tourId } = route.params;
  const tour = useTour(tourId);
  const [fav, setFav] = useState(false);

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

      <Text style={styles.blockTitle}>Доступность:</Text>
      <Text style={styles.accItem}>{tour.data.accessibility.wheelchair_accessible ? '✓' : '✕'} пандус</Text>
      <Text style={styles.accItem}>{tour.data.accessibility.avoid_stairs_possible ? '✓' : '✕'} широкие проходы</Text>
      <Text style={styles.accItem}>{tour.data.accessibility.avoid_stairs_possible ? '✓' : '✕'} ступени</Text>

      <Pressable style={styles.bookBtn} onPress={() => navigation.navigate('TourBooking', { tourId })}>
        <Text style={styles.bookBtnText}>Забронировать</Text>
      </Pressable>
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
  errorText: { color: colors.errorText, fontSize: 12, marginBottom: 8 },
});

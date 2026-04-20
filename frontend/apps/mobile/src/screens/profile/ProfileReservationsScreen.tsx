import { Feather } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { reservationsMock, type ReservationItem } from '../../entities/profile/mocks';
import { Accordion } from '../../shared/ui/Accordion';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { showSoonNotice } from '../../shared/ui/showSoonNotice';
import { colors } from '../../shared/theme/colors';

export function ProfileReservationsScreen() {
  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader />
        <Text style={styles.title}>Бронирования</Text>

        <View style={styles.grid}>
          {reservationsMock.map((item) => (
            <ReservationCard key={item.id} item={item} />
          ))}
        </View>

        <Accordion title="История" emptyLabel="История броней пока пуста" />
      </ScrollView>
    </View>
  );
}

function ReservationCard({ item }: { item: ReservationItem }) {
  const paid = item.status === 'paid';
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.ratingPill}>
          <Feather name="star" size={10} color={colors.white} />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviewsCount})
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.metaRow}>
        <Feather name="user" size={12} color={colors.textMuted} />
        <Text style={styles.metaText}>
          {item.guide}
          {item.capacity ? ` (${item.capacity})` : ''}
        </Text>
      </View>
      <Text style={styles.metaText}>{item.schedule}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.priceLabel}</Text>
        <Text style={[styles.status, paid ? styles.statusPaid : styles.statusUnpaid]}>
          {paid ? 'оплачено' : 'не оплачен'}
        </Text>
      </View>

      <Pressable
        style={styles.actionBtn}
        onPress={() =>
          showSoonNotice(
            paid ? 'Оставить отзыв' : 'Оплата',
            'Функция появится в следующих итерациях.',
          )
        }
      >
        <Text style={styles.actionBtnText}>
          {paid ? 'Оставить отзыв' : 'Оплатить'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  card: {
    width: '47.5%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    gap: 4,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: colors.line,
  },
  ratingPill: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.overlayCard,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 16,
    minHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusPaid: {
    color: colors.successText,
  },
  statusUnpaid: {
    color: colors.errorTextStrong,
  },
  actionBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  actionBtnText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

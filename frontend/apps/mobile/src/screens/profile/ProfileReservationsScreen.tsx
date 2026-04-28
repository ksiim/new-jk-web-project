import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { BookingPublic } from '../../entities/tour/types';
import {
  useBookings,
  useCancelBooking,
  useConfirmMockPayment,
  useRefundMockPayment,
} from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { Accordion } from '../../shared/ui/Accordion';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { extractApiError } from '../../shared/api/http';
import { colors } from '../../shared/theme/colors';

export function ProfileReservationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const bookings = useBookings({ page: 1, limit: 50 });
  const cancel = useCancelBooking();
  const confirmPayment = useConfirmMockPayment();
  const refundPayment = useRefundMockPayment();

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader />
        <Text style={styles.title}>Бронирования</Text>

        <View style={styles.grid}>
          {bookings.data?.data.map((item) => (
            <ReservationCard
              key={item.id}
              item={item}
              onCancel={async () => {
                await cancel.mutateAsync({ bookingId: item.id });
                await refresh();
              }}
              onConfirm={async () => {
                await confirmPayment.mutateAsync(item.id);
                await refresh();
              }}
              onRefund={async () => {
                await refundPayment.mutateAsync(item.id);
                await refresh();
              }}
              onOpen={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
              onReview={() =>
                navigation.navigate('TourDetail', {
                  tourId: item.tour.id,
                  bookingId: item.id,
                })
              }
            />
          ))}
          {!bookings.isLoading && (bookings.data?.data.length ?? 0) === 0 ? (
            <Text style={styles.metaText}>У вас пока нет бронирований</Text>
          ) : null}
        </View>
        {bookings.isError ? (
          <Text style={styles.errorText}>{extractApiError(bookings.error)}</Text>
        ) : null}

        <Accordion title="История" emptyLabel="История броней пока пуста" />
      </ScrollView>
    </View>
  );
}

function bookingStatusLabel(status: BookingPublic['status']): string {
  const map: Record<BookingPublic['status'], string> = {
    pending_payment: 'ожидает оплаты',
    confirmed: 'подтверждено',
    completed: 'завершено',
    cancelled: 'отменено',
    refunded: 'возврат',
  };
  return map[status];
}

function ReservationCard({
  item,
  onCancel,
  onConfirm,
  onRefund,
  onOpen,
  onReview,
}: {
  item: BookingPublic;
  onCancel: () => Promise<void>;
  onConfirm: () => Promise<void>;
  onRefund: () => Promise<void>;
  onOpen: () => void;
  onReview: () => void;
}) {
  const paid = item.status === 'confirmed' || item.status === 'completed';
  const canPay = item.status === 'pending_payment';
  const canCancel = item.status === 'pending_payment' || item.status === 'confirmed';
  const canRefund = item.status === 'confirmed' || item.status === 'completed';
  return (
    <View style={styles.card}>
      <View style={[styles.image, styles.imagePlaceholder]}>
        <Feather name="calendar" size={22} color={colors.textMuted} />
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.tour.title}
      </Text>
      <View style={styles.metaRow}>
        <Feather name="user" size={12} color={colors.textMuted} />
        <Text style={styles.metaText}>
          участников: {item.participants_count}
        </Text>
      </View>
      <Text style={styles.metaText}>
        {new Date(item.slot.starts_at).toLocaleString('ru-RU')}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {item.price_total.amount.toLocaleString('ru-RU')} {item.price_total.currency}
        </Text>
        <Text style={[styles.status, paid ? styles.statusPaid : styles.statusUnpaid]}>
          {bookingStatusLabel(item.status)}
        </Text>
      </View>

      <View style={styles.actionsColumn}>
        <Pressable style={styles.actionBtn} onPress={onOpen}>
          <Text style={styles.actionBtnText}>Детали</Text>
        </Pressable>
        {paid ? (
          <Pressable style={styles.actionBtn} onPress={onReview}>
            <Text style={styles.actionBtnText}>Оставить отзыв</Text>
          </Pressable>
        ) : null}
        {canPay ? (
          <Pressable style={styles.actionBtn} onPress={onConfirm}>
            <Text style={styles.actionBtnText}>Оплатить (mock)</Text>
          </Pressable>
        ) : null}
        {canCancel ? (
          <Pressable style={styles.actionBtn} onPress={onCancel}>
            <Text style={styles.actionBtnText}>Отменить</Text>
          </Pressable>
        ) : null}
        {canRefund ? (
          <Pressable style={styles.actionBtn} onPress={onRefund}>
            <Text style={styles.actionBtnText}>Возврат (mock)</Text>
          </Pressable>
        ) : null}
      </View>
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
  image: {
    width: '100%',
    height: 100,
    backgroundColor: colors.line,
    borderRadius: 10,
    marginBottom: 6,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
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
  actionsColumn: {
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    color: colors.errorText,
    fontSize: 12,
    marginBottom: 10,
  },
});

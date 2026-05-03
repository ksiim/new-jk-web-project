import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useBookingDetail, useCancelBooking } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { extractApiError } from '../../shared/api/http';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'BookingDetail'>;

function bookingStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending_payment: 'ожидает оплаты',
    confirmed: 'подтверждено',
    completed: 'завершено',
    cancelled: 'отменено',
    refunded: 'возврат',
  };
  return map[status] ?? status;
}

export function BookingDetailScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const queryClient = useQueryClient();
  const detail = useBookingDetail(bookingId);
  const cancel = useCancelBooking();

  if (detail.isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.meta}>Загрузка...</Text>
      </View>
    );
  }
  if (detail.isError || !detail.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{extractApiError(detail.error)}</Text>
      </View>
    );
  }

  const booking = detail.data;
  const canCancel =
    booking.status === 'pending_payment' || booking.status === 'confirmed';
  const canPay = booking.status === 'pending_payment';

  const refreshBooking = async () => {
    await queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', booking.id] });
    await queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <Text style={styles.title}>Детали брони</Text>
      <Text style={styles.block}>ID: {booking.id}</Text>
      <Text style={styles.block}>Тур: {booking.tour.title}</Text>
      <Text style={styles.block}>
        Начало: {new Date(booking.slot.starts_at).toLocaleString('ru-RU')}
      </Text>
      <Text style={styles.block}>
        Участников: {booking.participants_count}
      </Text>
      <Text style={styles.block}>Статус: {bookingStatusLabel(booking.status)}</Text>
      <Text style={styles.block}>
        Сумма: {booking.price_total.amount.toLocaleString('ru-RU')}{' '}
        {booking.price_total.currency}
      </Text>

      <Pressable
        style={styles.actionBtn}
        onPress={() =>
          navigation.navigate('TourDetail', {
            tourId: booking.tour.id,
            bookingId: booking.id,
          })
        }
      >
        <Text style={styles.actionText}>Открыть тур</Text>
      </Pressable>

      {canPay ? (
        <Pressable
          style={[styles.actionBtn, styles.payBtn]}
          onPress={() => navigation.navigate('TourPayment', { bookingId: booking.id })}
        >
          <Text style={[styles.actionText, styles.payText]}>Оплатить</Text>
        </Pressable>
      ) : null}

      {canCancel ? (
        <Pressable
          style={[styles.actionBtn, styles.cancelBtn]}
          onPress={async () => {
            await cancel.mutateAsync({ bookingId: booking.id });
            await refreshBooking();
          }}
          disabled={cancel.isPending}
        >
          <Text style={[styles.actionText, styles.cancelText]}>
            {cancel.isPending ? 'Отменяем...' : 'Отменить бронь'}
          </Text>
        </Pressable>
      ) : null}
      {cancel.isError ? (
        <Text style={styles.errorText}>{extractApiError(cancel.error)}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  block: { fontSize: 14, color: colors.textPrimary, marginBottom: 6 },
  meta: { color: colors.textMuted },
  errorText: { color: colors.errorText },
  actionBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  actionText: { color: colors.textPrimary, fontWeight: '600' },
  cancelBtn: {
    borderColor: colors.errorText,
  },
  cancelText: {
    color: colors.errorText,
  },
  payBtn: {
    borderColor: colors.accentButton,
    backgroundColor: colors.accentButton,
  },
  payText: {
    color: colors.white,
  },
});

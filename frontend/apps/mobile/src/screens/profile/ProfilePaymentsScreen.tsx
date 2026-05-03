import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { BookingPublic } from '../../entities/tour/types';
import { useBookings } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { extractApiError } from '../../shared/api/http';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';

function statusLabel(status: BookingPublic['status']): string {
  const map: Record<BookingPublic['status'], string> = {
    pending_payment: 'К оплате',
    confirmed: 'Оплачено',
    completed: 'Оплачено',
    cancelled: 'Отменено',
    refunded: 'Возврат',
  };
  return map[status];
}

export function ProfilePaymentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const bookings = useBookings({ page: 1, limit: 50 });

  const sorted = useMemo(() => {
    const list = bookings.data?.data ?? [];
    return [...list].sort(
      (a, b) => new Date(b.slot.starts_at).getTime() - new Date(a.slot.starts_at).getTime(),
    );
  }, [bookings.data?.data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ScreenHeader />
        <Text style={styles.title}>Платежи</Text>
        <Text style={styles.lead}>
          Операции по турам из ваших бронирований (сумма и статус).
        </Text>

        {bookings.isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.textPrimary} />
            <Text style={styles.meta}>Загружаем…</Text>
          </View>
        ) : null}

        {!bookings.isLoading && (bookings.data?.data.length ?? 0) === 0 ? (
          <Text style={styles.empty}>Здесь появятся оплаты по бронированиям туров.</Text>
        ) : null}

        {sorted.map((row) => (
          <PaymentRow key={row.id} item={row} navigation={navigation} />
        ))}

        {bookings.isError ? (
          <Text style={styles.error}>{extractApiError(bookings.error)}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function PaymentRow({
  item,
  navigation,
}: {
  item: BookingPublic;
  navigation: NativeStackNavigationProp<MainStackParamList>;
}) {
  const unpaid = item.status === 'pending_payment';
  const when = new Date(item.slot.starts_at).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const amount = `${item.price_total.amount.toLocaleString('ru-RU')} ${item.price_total.currency}`;

  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        unpaid
          ? navigation.navigate('TourPayment', { bookingId: item.id })
          : navigation.navigate('BookingDetail', { bookingId: item.id })
      }
    >
      <View style={styles.rowIcon}>
        <Feather name={unpaid ? 'clock' : 'check-circle'} size={22} color={colors.textPrimary} />
      </View>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {item.tour.title}
        </Text>
        <Text style={styles.rowMeta}>{when}</Text>
        <Text style={styles.rowAmount}>{amount}</Text>
        <Text style={[styles.badge, unpaid ? styles.badgeDue : styles.badgeOk]}>
          {statusLabel(item.status)}
        </Text>
      </View>
      <Feather name="chevron-right" size={22} color={colors.textMuted} />
    </Pressable>
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  lead: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 18,
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  meta: { color: colors.textMuted, fontSize: 14 },
  empty: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  rowMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeDue: { color: colors.errorTextStrong },
  badgeOk: { color: colors.successText },
  error: {
    marginTop: 12,
    color: colors.errorText,
    fontSize: 13,
  },
});

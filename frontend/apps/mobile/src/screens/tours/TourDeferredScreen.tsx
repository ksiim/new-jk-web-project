import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useBookingDetail, useTour } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'TourDeferred'>;

export function TourDeferredScreen({ route, navigation }: Props) {
  const { tourId, bookingId } = route.params;
  const tour = useTour(tourId);
  const booking = useBookingDetail(bookingId ?? null);
  const title = booking.data?.tour.title ?? tour.data?.title ?? 'Тур';
  const status = booking.data?.status;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <Text style={styles.title}>Бронирование: {title}</Text>
      {status ? (
        <Text style={styles.status}>Статус: {status === 'pending_payment' ? 'ожидает оплаты' : status}</Text>
      ) : null}
      <Text style={styles.body}>Оплатить тур можно позже в Профиле, в разделе Бронирования.</Text>
      <Text style={styles.body}>
        Оплату необходимо произвести не позднее, чем за 12 часов до начала тура, иначе бронь будет снята.
      </Text>
      <Pressable
        style={styles.btn}
        onPress={() =>
          bookingId
            ? navigation.navigate('BookingDetail', { bookingId })
            : navigation.navigate('ProfileReservations')
        }
      >
        <Text style={styles.btnText}>Перейти к оплате</Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.ghost]} onPress={() => navigation.navigate('TourDetail', { tourId })}>
        <Text style={styles.btnText}>Оплачу позже</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  title: { marginTop: 8, color: colors.textPrimary, fontWeight: '800', fontSize: 48 / 2, lineHeight: 29 },
  status: { marginTop: 10, color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  body: { marginTop: 24, color: colors.textPrimary, fontSize: 20 / 1.2, lineHeight: 31 },
  btn: {
    marginTop: 28,
    alignSelf: 'center',
    minWidth: 220,
    borderRadius: 12,
    backgroundColor: colors.accentButton,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghost: { marginTop: 12, backgroundColor: colors.tileSage },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 32 / 2 },
});

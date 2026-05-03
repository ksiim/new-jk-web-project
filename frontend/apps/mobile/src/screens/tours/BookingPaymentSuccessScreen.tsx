import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useBookingDetail } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { extractApiError } from '../../shared/api/http';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { showSoonNotice } from '../../shared/ui/showSoonNotice';
import { formatMeetingPoint } from './payment/formatMeeting';

type Props = NativeStackScreenProps<MainStackParamList, 'BookingPaymentSuccess'>;

export function BookingPaymentSuccessScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const detail = useBookingDetail(bookingId);

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
  const starts = new Date(booking.slot.starts_at);
  const dateStr = `${starts.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} ${starts.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  const place = formatMeetingPoint(booking.meeting_point);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <ScreenHeader />
      <Text style={styles.title}>Бронирование тура{'\n'}подтверждено</Text>

      <View style={styles.block}>
        <Text style={styles.line}>
          <Text style={styles.em}>Тур: </Text>
          <Text>{booking.tour.title}</Text>
        </Text>
        <Text style={[styles.line, styles.lineMargin]}>
          <Text style={styles.em}>Дата и время: </Text>
          <Text>{dateStr}</Text>
        </Text>
        <Text style={styles.line}>
          <Text style={styles.em}>Место встречи: </Text>
          <Text>{place}</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <SaveButton
          style={styles.actionBtnWide}
          title="Написать гиду"
          onPress={() => showSoonNotice('Чат с гидом')}
        />
        <View style={{ height: 12 }} />
        <SaveButton
          style={styles.actionBtnWide}
          title="Смотреть тур"
          onPress={() =>
            navigation.navigate('TourDetail', {
              tourId: booking.tour.id,
              bookingId: booking.id,
            })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  meta: { color: colors.textMuted },
  errorText: { color: colors.errorText, textAlign: 'center' },
  title: {
    marginTop: 8,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 24,
  },
  block: { gap: 4 },
  line: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  lineMargin: { marginVertical: 4 },
  em: { fontWeight: '700' },
  actions: { marginTop: 36, alignSelf: 'stretch', width: '100%' },
  actionBtnWide: { alignSelf: 'stretch' },
});

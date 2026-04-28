import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTour, useTourSlots } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'TourBooking'>;

export function TourBookingScreen({ route, navigation }: Props) {
  const { tourId } = route.params;
  const tour = useTour(tourId);
  const slots = useTourSlots(tourId);
  const [participants, setParticipants] = useState('1');
  const [comment, setComment] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [pickedTime, setPickedTime] = useState('18:00');
  const firstSlot = slots.data?.[0];

  const totalPrice = useMemo(() => {
    const count = Number(participants) || 1;
    return (tour.data?.price.amount ?? 0) * Math.max(1, count);
  }, [participants, tour.data?.price.amount]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <Text style={styles.title}>Бронирование: {tour.data?.title ?? 'Тур'}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Дата:</Text>
        <Pressable style={styles.valueChip} onPress={() => setCalendarOpen(true)}>
          <Text style={styles.valueText}>
            {firstSlot ? new Date(firstSlot.starts_at).toLocaleDateString('ru-RU') : '23.04.2026'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Начало:</Text>
        <Pressable style={styles.valueChip} onPress={() => setTimeOpen((v) => !v)}>
          <Text style={styles.valueText}>{pickedTime}</Text>
          <Feather name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
        {timeOpen ? (
          <View style={styles.timePopover}>
            {['16:00', '17:00', '18:00', '19:00'].map((slot) => (
              <Pressable
                key={slot}
                style={styles.timeOption}
                onPress={() => {
                  setPickedTime(slot);
                  setTimeOpen(false);
                }}
              >
                <Text style={styles.timeOptionText}>{slot}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <Text style={styles.meta}>Тур займет около {Math.max(1, Math.round((tour.data?.duration_minutes ?? 240) / 60))} часов</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Количество человек:</Text>
        <TextInput
          value={participants}
          onChangeText={setParticipants}
          keyboardType="number-pad"
          style={styles.smallInput}
        />
      </View>
      <Text style={styles.meta}>Осталось {firstSlot?.available_capacity ?? 6} мест</Text>

      <Text style={[styles.label, { marginTop: 10 }]}>Добавить комментарий:</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        style={styles.comment}
        multiline
        placeholder="Здесь вы можете написать то, что необходимо знать гиду..."
        placeholderTextColor={colors.textMuted}
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Итого:</Text>
        <Text style={styles.totalValue}>
          1 x {(totalPrice || 2500).toLocaleString('ru-RU')} р.
        </Text>
      </View>

      <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('TourDeferred', { tourId })}>
        <Text style={styles.primaryBtnText}>Перейти к оплате</Text>
      </Pressable>
      <Pressable style={[styles.primaryBtn, styles.secondaryBtn]} onPress={() => navigation.navigate('TourDeferred', { tourId })}>
        <Text style={styles.primaryBtnText}>Оплачу позже</Text>
      </Pressable>

      <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setCalendarOpen(false)}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHead}>
              <Feather name="chevron-left" size={18} color={colors.textPrimary} />
              <Text style={styles.calendarTitle}>Апрель 2021</Text>
              <Feather name="chevron-right" size={18} color={colors.textPrimary} />
            </View>
            <View style={styles.weekRow}>
              {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((d) => (
                <Text key={d} style={styles.weekLabel}>{d}</Text>
              ))}
            </View>
            <View style={styles.daysGrid}>
              {['29', '30', '31', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '1', '2'].map((d, i) => (
                <Text key={`${d}-${i}`} style={[styles.day, d === '23' && styles.dayActive]}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  title: { marginTop: 8, color: colors.textPrimary, fontWeight: '800', fontSize: 48 / 2, lineHeight: 29 },
  row: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { color: colors.textPrimary, fontWeight: '700', fontSize: 18 / 1.2 },
  valueChip: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
  meta: { color: colors.textMuted, marginTop: 6, fontSize: 16 / 1.2 },
  smallInput: {
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  comment: {
    marginTop: 8,
    minHeight: 96,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  totalRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.textPrimary, fontSize: 34 / 2, fontWeight: '800' },
  totalValue: { color: colors.textPrimary, fontSize: 34 / 2, fontWeight: '800' },
  primaryBtn: {
    marginTop: 16,
    alignSelf: 'center',
    minWidth: 240,
    borderRadius: 12,
    backgroundColor: colors.accentButton,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  secondaryBtn: { backgroundColor: colors.tileSage },
  primaryBtnText: { color: colors.white, fontSize: 32 / 2, fontWeight: '700' },
  timePopover: {
    position: 'absolute',
    right: 0,
    top: 42,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    zIndex: 10,
  },
  timeOption: { paddingHorizontal: 12, paddingVertical: 8 },
  timeOptionText: { color: colors.textPrimary, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 12,
  },
  calendarHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarTitle: { color: colors.textPrimary, fontSize: 28 / 2, fontWeight: '700' },
  weekRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  weekLabel: { width: 36, textAlign: 'center', color: colors.textSubtle, fontSize: 12 },
  daysGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  day: { width: `${100 / 7}%`, textAlign: 'center', color: colors.textPrimary, fontSize: 16 },
  dayActive: { color: '#E44A3D', fontWeight: '800' },
});

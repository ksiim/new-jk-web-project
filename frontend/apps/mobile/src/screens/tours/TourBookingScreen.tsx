import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCreateBooking, useTour, useTourSlots } from '../../entities/tour/hooks';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { extractApiError } from '../../shared/api/http';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'TourBooking'>;

function formatDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatSlotDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });
}

export function TourBookingScreen({ route, navigation }: Props) {
  const { tourId } = route.params;
  const tour = useTour(tourId);
  const slots = useTourSlots(tourId);
  const createBooking = useCreateBooking();
  const [participants, setParticipants] = useState('1');
  const [comment, setComment] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const availableSlots = useMemo(
    () =>
      (slots.data ?? [])
        .filter((slot) => slot.status === 'available' && slot.available_capacity > 0)
        .sort(
          (a, b) =>
            new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
        ),
    [slots.data],
  );
  const effectiveSlotId = selectedSlotId ?? availableSlots[0]?.id ?? null;
  const selectedSlot = useMemo(
    () => availableSlots.find((slot) => slot.id === effectiveSlotId) ?? availableSlots[0] ?? null,
    [availableSlots, effectiveSlotId],
  );
  const selectedDateKey = selectedSlot ? formatDateKey(selectedSlot.starts_at) : null;
  const dateOptions = useMemo(() => {
    const seen = new Set<string>();
    return availableSlots.filter((slot) => {
      const key = formatDateKey(slot.starts_at);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [availableSlots]);
  const timeOptions = useMemo(
    () =>
      selectedDateKey
        ? availableSlots.filter((slot) => formatDateKey(slot.starts_at) === selectedDateKey)
        : availableSlots,
    [availableSlots, selectedDateKey],
  );
  const participantsCount = Math.max(1, Number.parseInt(participants, 10) || 1);
  const maxCapacity = selectedSlot?.available_capacity ?? 0;
  const participantsOverflow = maxCapacity > 0 && participantsCount > maxCapacity;
  const unitPrice = selectedSlot?.price.amount ?? tour.data?.price.amount ?? 0;

  const totalPrice = useMemo(() => {
    return unitPrice * participantsCount;
  }, [participantsCount, unitPrice]);

  const slotDate = selectedSlot ? formatSlotDate(selectedSlot.starts_at) : 'Нет слотов';
  const slotTime = selectedSlot
    ? new Date(selectedSlot.starts_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const handleBook = async (next: 'payment' | 'defer') => {
    if (!selectedSlot || participantsOverflow || createBooking.isPending) return;
    const idempotency_key = `${tourId}-${selectedSlot.id}-${Date.now()}`;
    const booking = await createBooking.mutateAsync({
      tour_id: tourId,
      slot_id: selectedSlot.id,
      participants_count: participantsCount,
      comment: comment.trim() || undefined,
      idempotency_key,
    });
    if (next === 'payment') {
      navigation.navigate('TourPayment', { bookingId: booking.id });
      return;
    }
    navigation.navigate('TourDeferred', { tourId, bookingId: booking.id });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <Text style={styles.title}>Бронирование: {tour.data?.title ?? 'Тур'}</Text>
      {slots.isLoading ? (
        <Text style={styles.meta}>Загружаем доступные слоты...</Text>
      ) : null}
      {slots.isError ? (
        <Text style={styles.errorText}>{extractApiError(slots.error)}</Text>
      ) : null}

      <View style={styles.row}>
        <Text style={styles.label}>Дата:</Text>
        <Pressable style={styles.valueChip} onPress={() => setCalendarOpen(true)}>
          <Text style={styles.valueText}>{slotDate}</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Начало:</Text>
        <Pressable style={styles.valueChip} onPress={() => setTimeOpen((v) => !v)}>
          <Text style={styles.valueText}>{slotTime}</Text>
          <Feather name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
        {timeOpen ? (
          <View style={styles.timePopover}>
            {timeOptions.map((slot) => {
              const label = new Date(slot.starts_at).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
              <Pressable
                key={slot.id}
                style={styles.timeOption}
                onPress={() => {
                  setSelectedSlotId(slot.id);
                  setTimeOpen(false);
                }}
              >
                <Text style={styles.timeOptionText}>{label}</Text>
              </Pressable>
              );
            })}
            {timeOptions.length === 0 ? (
              <Text style={styles.timeOptionText}>Доступных слотов нет</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <Text style={styles.meta}>Тур займет около {Math.max(1, Math.round((tour.data?.duration_minutes ?? 240) / 60))} часов</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Количество человек:</Text>
        <TextInput
          value={String(participantsCount)}
          onChangeText={(value) => setParticipants(value.replace(/[^0-9]/g, '').slice(0, 2))}
          keyboardType="number-pad"
          style={styles.smallInput}
        />
      </View>
      <Text style={styles.meta}>
        Осталось {selectedSlot?.available_capacity ?? 0} мест
      </Text>
      {participantsOverflow ? (
        <Text style={styles.errorText}>Количество участников превышает доступные места в слоте</Text>
      ) : null}

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
          {participantsCount} x {unitPrice.toLocaleString('ru-RU')} = {totalPrice.toLocaleString('ru-RU')} р.
        </Text>
      </View>

      <Pressable
        style={[
          styles.primaryBtn,
          (!selectedSlot || participantsOverflow || createBooking.isPending) && styles.disabledBtn,
        ]}
        disabled={!selectedSlot || participantsOverflow || createBooking.isPending}
        onPress={() => handleBook('payment')}
      >
        <Text style={styles.primaryBtnText}>Перейти к оплате</Text>
      </Pressable>
      <Pressable
        style={[
          styles.primaryBtn,
          styles.secondaryBtn,
          (!selectedSlot || participantsOverflow || createBooking.isPending) && styles.disabledBtn,
        ]}
        disabled={!selectedSlot || participantsOverflow || createBooking.isPending}
        onPress={() => handleBook('defer')}
      >
        <Text style={styles.primaryBtnText}>Оплачу позже</Text>
      </Pressable>
      {createBooking.isError ? (
        <Text style={styles.errorText}>{extractApiError(createBooking.error)}</Text>
      ) : null}

      <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setCalendarOpen(false)}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHead}>
              <Text style={styles.calendarTitle}>Доступные даты</Text>
            </View>
            {dateOptions.length === 0 ? (
              <Text style={styles.emptyText}>Слотов пока нет</Text>
            ) : null}
            {dateOptions.map((slot) => {
              const active = selectedDateKey === formatDateKey(slot.starts_at);
              return (
                <Pressable
                  key={formatDateKey(slot.starts_at)}
                  style={[styles.dateOption, active && styles.dateOptionActive]}
                  onPress={() => {
                    setSelectedSlotId(slot.id);
                    setCalendarOpen(false);
                  }}
                >
                  <Text style={[styles.dateOptionText, active && styles.dateOptionTextActive]}>
                    {formatSlotDate(slot.starts_at)}
                  </Text>
                </Pressable>
              );
            })}
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
  disabledBtn: { opacity: 0.5 },
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
  dateOption: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  dateOptionActive: {
    borderColor: colors.accentButton,
    backgroundColor: colors.accentButton,
  },
  dateOptionText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  dateOptionTextActive: { color: colors.white },
  emptyText: { marginTop: 10, color: colors.textMuted, fontSize: 13 },
  errorText: { marginTop: 8, color: colors.errorText, fontSize: 12 },
});

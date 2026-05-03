import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuthStore } from '../../entities/auth/authStore';
import {
  useBookings,
  useCreateTour,
  useCreateTourSlot,
  useTours,
} from '../../entities/tour/hooks';
import type { TourPublic } from '../../entities/tour/types';
import { extractApiError } from '../../shared/api/http';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { Toggle } from '../../shared/ui/Toggle';

const CITY_ID = 'ekb';
const EKATERINBURG_MEETING = {
  lat: 56.8076,
  lng: 60.5971,
  address: 'ул. Краснолесья, д. 78',
};

function toNumber(value: string, fallback: number) {
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildSlotIso(date: string, time: string, durationMinutes: number) {
  const startsAt = new Date(`${date.trim()}T${time.trim()}:00`);
  if (Number.isNaN(startsAt.getTime())) return null;
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
  return {
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
  };
}

function tomorrowDateInput() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function guideName(user: ReturnType<typeof useAuthStore.getState>['user']) {
  if (!user) return 'Гид';
  return [user.name, user.surname].filter(Boolean).join(' ').trim() || user.email;
}

export function GuideDashboardScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const tours = useTours({ city_id: CITY_ID, page: 1, limit: 100 });
  const bookings = useBookings({ page: 1, limit: 100 });
  const createTour = useCreateTour();
  const createSlot = useCreateTourSlot();

  const [title, setTitle] = useState('Скетчинг в старом городе');
  const [description, setDescription] = useState(
    'Добро пожаловать на уникальную экскурсию, где история города переплетается с практикой скетчинга. Сегодня мы не просто прогуляемся по старинным улочкам, но и научимся замечать детали архитектуры.',
  );
  const [price, setPrice] = useState('2500');
  const [durationHours, setDurationHours] = useState('4');
  const [groupSize, setGroupSize] = useState('6');
  const [meetingAddress, setMeetingAddress] = useState(EKATERINBURG_MEETING.address);
  const [tags, setTags] = useState('art, history, walk');
  const [wheelchair, setWheelchair] = useState(false);
  const [avoidStairs, setAvoidStairs] = useState(true);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [slotDate, setSlotDate] = useState(tomorrowDateInput());
  const [slotTime, setSlotTime] = useState('18:00');
  const [slotCapacity, setSlotCapacity] = useState('6');
  const [slotPrice, setSlotPrice] = useState('2500');
  const [successText, setSuccessText] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fullName = guideName(user);
  const myTours = useMemo(() => {
    const normalizedName = fullName.toLowerCase();
    return (tours.data?.data ?? []).filter(
      (tour) =>
        tour.guide.id === user?.id ||
        tour.guide.name.toLowerCase().includes(normalizedName),
    );
  }, [fullName, tours.data?.data, user?.id]);

  const effectiveSelectedTourId = selectedTourId ?? myTours[0]?.id ?? null;
  const selectedTour = myTours.find((tour) => tour.id === effectiveSelectedTourId) ?? null;
  const myTourIds = new Set(myTours.map((item) => item.id));
  const myToursBookings = (bookings.data?.data ?? []).filter((item) =>
    myTourIds.has(item.tour.id),
  );
  const reviewsTotal = myTours.reduce((sum, item) => sum + item.reviews_count, 0);
  const avgRating = myTours.length
    ? myTours.reduce((sum, item) => sum + item.rating, 0) / myTours.length
    : 0;

  const refreshTours = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tours'] });
  };

  const handleCreateTour = async () => {
    setFormError(null);
    setSuccessText(null);
    if (!title.trim() || !description.trim()) {
      setFormError('Заполните название и описание тура');
      return;
    }

    try {
      const created = await createTour.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        city_id: CITY_ID,
        guide_id: user?.id ?? `guide_${Date.now()}`,
        guide_name: fullName,
        guide_rating: 0,
        guide_reviews_count: 0,
        guide_bio: 'Люблю свой город и знаю о нем почти все. Проведу по местам, которые обычно не попадают в стандартные маршруты.',
        format: 'offline_guided',
        language: 'ru',
        duration_minutes: Math.max(1, toNumber(durationHours, 4)) * 60,
        group_size_max: Math.max(1, toNumber(groupSize, 6)),
        price_amount: Math.max(0, toNumber(price, 2500)),
        price_currency: 'RUB',
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        meeting_lat: EKATERINBURG_MEETING.lat,
        meeting_lng: EKATERINBURG_MEETING.lng,
        meeting_address: meetingAddress.trim() || EKATERINBURG_MEETING.address,
        wheelchair_accessible: wheelchair,
        avoid_stairs_possible: avoidStairs,
        rating: 0,
        reviews_count: 0,
        images: [],
        cancellation_policy: 'free_24h',
        route_distance_meters: 0,
        route_points_count: 0,
      });
      setSelectedTourId(created.id);
      setSuccessText('Тур создан. Теперь добавьте слот, чтобы турист смог его забронировать.');
      await refreshTours();
    } catch (error) {
      setFormError(extractApiError(error));
    }
  };

  const handleCreateSlot = async () => {
    setFormError(null);
    setSuccessText(null);
    const tourId = effectiveSelectedTourId;
    if (!tourId) {
      setFormError('Сначала создайте или выберите тур');
      return;
    }

    const durationMinutes = Math.max(
      30,
      (selectedTour?.duration_minutes ?? Math.max(1, toNumber(durationHours, 4)) * 60),
    );
    const slotDates = buildSlotIso(slotDate, slotTime, durationMinutes);
    if (!slotDates) {
      setFormError('Введите дату в формате YYYY-MM-DD и время в формате HH:mm');
      return;
    }

    try {
      await createSlot.mutateAsync({
        tourId,
        payload: {
          ...slotDates,
          available_capacity: Math.max(1, toNumber(slotCapacity, 6)),
          price: {
            amount: Math.max(0, toNumber(slotPrice, toNumber(price, 2500))),
            currency: 'RUB',
          },
          status: 'available',
        },
      });
      setSuccessText('Слот добавлен. Тур появится в каталоге с доступным временем.');
      await refreshTours();
      await queryClient.invalidateQueries({ queryKey: ['tours', 'slots', tourId] });
    } catch (error) {
      setFormError(extractApiError(error));
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <Text style={styles.title}>Кабинет гида</Text>
      <Text style={styles.subtitle}>Создайте тур и слот для демонстрационного каталога</Text>

      <View style={styles.statsRow}>
        <StatCard label="Мои туры" value={String(myTours.length)} />
        <StatCard label="Бронирования" value={String(myToursBookings.length)} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Средний рейтинг" value={avgRating ? avgRating.toFixed(1) : '0.0'} />
        <StatCard label="Отзывы" value={String(reviewsTotal)} />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.blockTitle}>Новый тур</Text>
        <Field label="Название" value={title} onChangeText={setTitle} />
        <Field
          label="Описание"
          value={description}
          onChangeText={setDescription}
          multiline
          inputStyle={styles.textarea}
        />
        <View style={styles.twoCols}>
          <Field label="Цена, руб." value={price} onChangeText={setPrice} keyboardType="number-pad" />
          <Field label="Часы" value={durationHours} onChangeText={setDurationHours} keyboardType="number-pad" />
        </View>
        <View style={styles.twoCols}>
          <Field label="Мест в группе" value={groupSize} onChangeText={setGroupSize} keyboardType="number-pad" />
          <Field label="Теги" value={tags} onChangeText={setTags} />
        </View>
        <Field label="Место встречи" value={meetingAddress} onChangeText={setMeetingAddress} />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Доступно для коляски</Text>
          <Toggle value={wheelchair} onValueChange={setWheelchair} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Можно избегать лестниц</Text>
          <Toggle value={avoidStairs} onValueChange={setAvoidStairs} />
        </View>
        <SaveButton
          title="Создать тур"
          onPress={handleCreateTour}
          loading={createTour.isPending}
        />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.blockTitle}>Слот тура</Text>
        {tours.isLoading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : null}
        <View style={styles.chipsWrap}>
          {myTours.map((tour) => (
            <Pressable
              key={tour.id}
              style={[
                styles.tourChip,
                effectiveSelectedTourId === tour.id && styles.tourChipActive,
              ]}
              onPress={() => setSelectedTourId(tour.id)}
            >
              <Text
                style={[
                  styles.tourChipText,
                  effectiveSelectedTourId === tour.id && styles.tourChipTextActive,
                ]}
              >
                {tour.title}
              </Text>
            </Pressable>
          ))}
        </View>
        {myTours.length === 0 ? (
          <Text style={styles.emptyText}>Создайте первый тур, затем добавьте слот.</Text>
        ) : null}
        <View style={styles.twoCols}>
          <Field label="Дата" value={slotDate} onChangeText={setSlotDate} placeholder="2026-05-02" />
          <Field label="Время" value={slotTime} onChangeText={setSlotTime} placeholder="18:00" />
        </View>
        <View style={styles.twoCols}>
          <Field label="Мест" value={slotCapacity} onChangeText={setSlotCapacity} keyboardType="number-pad" />
          <Field label="Цена" value={slotPrice} onChangeText={setSlotPrice} keyboardType="number-pad" />
        </View>
        <SaveButton
          title="Добавить слот"
          onPress={handleCreateSlot}
          loading={createSlot.isPending}
          disabled={!effectiveSelectedTourId}
        />
      </View>

      {successText ? <Text style={styles.successText}>{successText}</Text> : null}
      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

      <Text style={styles.blockTitle}>Мои туры</Text>
      {myTours.length === 0 ? (
        <Text style={styles.emptyText}>Туры гида пока не найдены</Text>
      ) : (
        myTours.map((tour) => <TourCard key={tour.id} tour={tour} />)
      )}

      <Text style={styles.blockTitle}>Бронирования по моим турам</Text>
      {myToursBookings.length === 0 ? (
        <Text style={styles.emptyText}>Бронирований пока нет</Text>
      ) : (
        myToursBookings.map((booking) => (
          <View key={booking.id} style={styles.card}>
            <Text style={styles.cardTitle}>{booking.tour.title}</Text>
            <Text style={styles.cardMeta}>
              {new Date(booking.slot.starts_at).toLocaleString('ru-RU')}
            </Text>
            <Text style={styles.cardMeta}>
              участников {booking.participants_count} · статус {booking.status}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
  placeholder,
  inputStyle,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
  placeholder?: string;
  inputStyle?: object;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, inputStyle]}
      />
    </View>
  );
}

function TourCard({ tour }: { tour: TourPublic }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{tour.title}</Text>
      <Text style={styles.cardMeta}>
        {Math.round(tour.duration_minutes / 60)} ч ·{' '}
        {tour.price.amount.toLocaleString('ru-RU')} {tour.price.currency}
      </Text>
      <Text style={styles.cardMeta}>
        Гид: {tour.guide.name} · рейтинг {tour.rating.toFixed(1)} · отзывов{' '}
        {tour.reviews_count}
      </Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  title: { marginTop: 6, color: colors.textPrimary, fontWeight: '800', fontSize: 28 },
  subtitle: { marginTop: 4, color: colors.textMuted, fontSize: 13 },
  statsRow: { marginTop: 10, flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statLabel: { marginTop: 4, fontSize: 12, color: colors.textMuted },
  formCard: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    gap: 10,
  },
  blockTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  field: { flex: 1, gap: 5 },
  fieldLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
  },
  textarea: { minHeight: 96, textAlignVertical: 'top' },
  twoCols: { flexDirection: 'row', gap: 10 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  toggleLabel: { flex: 1, color: colors.textPrimary, fontSize: 13 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tourChip: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tourChipActive: {
    borderColor: colors.accentButton,
    backgroundColor: colors.accentButton,
  },
  tourChipText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  tourChipTextActive: { color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    marginBottom: 8,
  },
  cardTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  cardMeta: { marginTop: 3, color: colors.textMuted, fontSize: 12 },
  emptyText: { color: colors.textMuted, fontSize: 13 },
  successText: {
    marginTop: 12,
    color: colors.successText,
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 12,
    color: colors.errorText,
    fontSize: 13,
    fontWeight: '700',
  },
});

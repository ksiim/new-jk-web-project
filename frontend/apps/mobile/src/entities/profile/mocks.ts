/**
 * Демо-данные для разделов профиля.
 * Поля соответствуют макетам (Избранное / Отзывы / Бронирования).
 * Фотографии берутся по URL — можно заменить на локальные ассеты.
 */
export type FavouriteItem = {
  id: string;
  title: string;
  image: string;
  guide: string;
  capacity: string;
  schedule: string;
  priceLabel: string;
  rating: number;
  reviewsCount: number;
};

export type ReviewItem = {
  id: string;
  title: string;
  rating: number;
  text: string;
};

export type ReservationStatus = 'paid' | 'unpaid';

export type ReservationItem = {
  id: string;
  title: string;
  image: string;
  guide: string;
  capacity?: string;
  schedule: string;
  priceLabel: string;
  rating: number;
  reviewsCount: number;
  status: ReservationStatus;
};

export const favouritesMock: FavouriteItem[] = [
  {
    id: 'fav-1',
    title: 'Скетчинг в старом городе',
    image:
      'https://images.unsplash.com/photo-1533558493269-63dc26b6dd4c?auto=format&fit=crop&w=800&q=80',
    guide: 'Анна',
    capacity: 'до 6 чел.',
    schedule: 'Сегодня в 16:00 (4 часа)',
    priceLabel: '2 500 руб.',
    rating: 4.9,
    reviewsCount: 120,
  },
  {
    id: 'fav-2',
    title: 'Театральный поход имени Лавровского',
    image:
      'https://images.unsplash.com/photo-1522776851755-3914f32d7220?auto=format&fit=crop&w=800&q=80',
    guide: 'Глеб',
    capacity: undefined as unknown as string,
    schedule: 'Завтра в 19:30',
    priceLabel: '3 200 руб.',
    rating: 4.7,
    reviewsCount: 32,
  },
  {
    id: 'fav-3',
    title: 'Скетчинг в старом городе',
    image:
      'https://images.unsplash.com/photo-1533558493269-63dc26b6dd4c?auto=format&fit=crop&w=800&q=80',
    guide: 'Анна',
    capacity: 'до 6 чел.',
    schedule: 'Сегодня в 16:00 (4 часа)',
    priceLabel: '2 500 руб.',
    rating: 4.9,
    reviewsCount: 120,
  },
  {
    id: 'fav-4',
    title: 'Театральный поход имени Лавровского',
    image:
      'https://images.unsplash.com/photo-1522776851755-3914f32d7220?auto=format&fit=crop&w=800&q=80',
    guide: 'Глеб',
    capacity: undefined as unknown as string,
    schedule: 'Завтра в 19:30',
    priceLabel: '3 200 руб.',
    rating: 4.7,
    reviewsCount: 32,
  },
];

export const reviewsMock: ReviewItem[] = [
  {
    id: 'rev-1',
    title: 'Скетчинг в старом городе',
    rating: 4,
    text: 'Очень классный тур, начинается прямо у старинного фонтана, где мостовые ещё помнят стук подков. Представьте: вы не просто идёте по узким улочкам с табличками, а по-настоящему видите город глазами художника.',
  },
];

export const reservationsMock: ReservationItem[] = [
  {
    id: 'res-1',
    title: 'Скетчинг в старом городе',
    image:
      'https://images.unsplash.com/photo-1533558493269-63dc26b6dd4c?auto=format&fit=crop&w=800&q=80',
    guide: 'Анна',
    capacity: 'до 6 чел.',
    schedule: 'Сегодня в 16:00 (4 часа)',
    priceLabel: '2 500 руб.',
    rating: 4.9,
    reviewsCount: 120,
    status: 'paid',
  },
  {
    id: 'res-2',
    title: 'Театральный поход имени Лавровского',
    image:
      'https://images.unsplash.com/photo-1522776851755-3914f32d7220?auto=format&fit=crop&w=800&q=80',
    guide: 'Глеб',
    schedule: 'Завтра в 19:30',
    priceLabel: '3 200 руб.',
    rating: 4.7,
    reviewsCount: 32,
    status: 'unpaid',
  },
];

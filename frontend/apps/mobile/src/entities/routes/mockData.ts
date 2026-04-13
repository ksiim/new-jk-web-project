export type RouteItem = {
  id: string;
  title: string;
  distanceKm: number;
  durationHours: number;
  pace: string;
  status: 'active' | 'planned';
};

export type NearbyItem = {
  id: string;
  title: string;
  schedule: string;
  price: string;
  rating: number;
  votes: number;
};

export const routes: RouteItem[] = [
  {
    id: 'r1',
    title: 'Прогулка: искусство и кофе',
    distanceKm: 3.2,
    durationHours: 2,
    pace: 'спокойно',
    status: 'active',
  },
  {
    id: 'r2',
    title: 'Утренний маршрут',
    distanceKm: 1.5,
    durationHours: 1,
    pace: 'спокойно',
    status: 'planned',
  },
  {
    id: 'r3',
    title: 'Вечерний арт',
    distanceKm: 2.8,
    durationHours: 2,
    pace: 'умеренно',
    status: 'planned',
  },
];

export const nearbyItems: NearbyItem[] = [
  {
    id: 'n1',
    title: 'Скетчинг в старом городе',
    schedule: 'Сегодня в 16:00',
    price: '2 500 руб.',
    rating: 4.9,
    votes: 120,
  },
  {
    id: 'n2',
    title: 'Театральный поход имени Лавровского',
    schedule: 'Завтра в 19:30',
    price: '3 200 руб.',
    rating: 4.7,
    votes: 132,
  },
];

export const activeRoutePoints = [
  {
    id: 'p1',
    title: 'Галерея имени Павла Морского Петрафановского',
    imageLabel: '4,9 (120)',
  },
  {
    id: 'p2',
    title: 'Кофейня DUO',
    imageLabel: '4,7 (132)',
  },
];

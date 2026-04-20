import type {
  AccessibilityId,
  InterestId,
} from '../preferences/preferencesStore';

export type Place = {
  id: string;
  name: string;
  description: string;
  /** Категории, пересекаются с interests в онбординге. */
  categories: InterestId[];
  /** Средняя цена посещения на одного (₽). null — бесплатно. */
  priceMin: number | null;
  priceMax: number | null;
  /** Сколько примерно занимает по времени, в часах. */
  durationHours: number;
  /** Координаты. lng — долгота (восток), lat — широта (север). */
  lat: number;
  lng: number;
  address: string;
  /** Какие особенности доступности поддерживает место. */
  accessibility: AccessibilityId[];
};

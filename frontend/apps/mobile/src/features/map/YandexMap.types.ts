import type { Place } from '../../entities/place/types';

export type YandexMapProps = {
  places: Place[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
};

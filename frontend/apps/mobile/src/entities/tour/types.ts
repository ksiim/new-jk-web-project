export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ListResponse<T> = {
  data: T[];
  meta: PaginationMeta;
  error: null;
};

export type DetailResponse<T> = {
  data: T;
  meta: Record<string, unknown>;
  error: null;
};

export type Price = {
  amount: number;
  currency: string;
};

export type TourAccessibility = {
  wheelchair_accessible: boolean;
  avoid_stairs_possible: boolean;
};

export type GuidePublic = {
  id: string;
  name: string;
  rating: number;
  reviews_count: number;
};

export type TourPublic = {
  id: string;
  title: string;
  short_description: string;
  city_id: string;
  format: string;
  language: string;
  duration_minutes: number;
  price: Price;
  guide: GuidePublic;
  rating: number;
  reviews_count: number;
  cover_image_url: string | null;
  accessibility: TourAccessibility;
};

export type TourDetail = {
  id: string;
  title: string;
  description: string;
  city_id: string;
  rating: number;
  reviews_count: number;
  guide: GuidePublic & { avatar_url?: string | null; bio?: string | null };
  format: string;
  language: string;
  duration_minutes: number;
  group_size_max: number;
  price: Price;
  tags: string[];
  meeting_point: { lat: number; lng: number; address?: string | null };
  route_preview: { distance_meters: number; points_count: number };
  accessibility: TourAccessibility;
  images: string[];
  cancellation_policy: string;
};

export type TourSlotPublic = {
  id: string;
  starts_at: string;
  ends_at: string;
  available_capacity: number;
  price: Price;
  status: 'available' | 'sold_out' | 'cancelled';
};

export type BookingCreatePayload = {
  tour_id: string;
  slot_id: string;
  participants_count: number;
  contact_phone?: string;
  comment?: string;
  idempotency_key?: string;
};

export type BookingCreatedPublic = {
  id: string;
  tour_id: string;
  slot_id: string;
  participants_count: number;
  status: string;
  price_total: Price;
  payment: {
    payment_id: string;
    payment_url: string;
  };
  created_at: string;
};

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'refunded';

export type BookingPublic = {
  id: string;
  tour: {
    id: string;
    title: string;
  };
  slot: {
    id: string;
    starts_at: string;
  };
  participants_count: number;
  status: BookingStatus;
  price_total: Price;
};

export type BookingDetail = BookingPublic & {
  slot: {
    id: string;
    starts_at: string;
    ends_at?: string | null;
  };
  meeting_point: Record<string, string | null>;
};

export type BookingCancelledPublic = {
  id: string;
  status: BookingStatus;
  refund_status: 'not_required' | 'pending' | 'refunded';
};

export type MockPaymentPublic = {
  booking_id: string;
  payment_id: string;
  status: BookingStatus;
};

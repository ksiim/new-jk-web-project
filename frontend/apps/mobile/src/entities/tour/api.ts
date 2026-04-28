import { http } from '../../shared/api/http';
import type {
  BookingCancelledPublic,
  BookingCreatePayload,
  BookingCreatedPublic,
  BookingDetail,
  BookingPublic,
  DetailResponse,
  ListResponse,
  MockPaymentPublic,
  TourDetail,
  TourPublic,
  TourSlotPublic,
} from './types';

export async function fetchTours(params?: Record<string, unknown>) {
  const { data } = await http.get<ListResponse<TourPublic>>('/tours', { params });
  return data;
}

export async function fetchTour(tourId: string) {
  const { data } = await http.get<DetailResponse<TourDetail>>(`/tours/${tourId}`);
  return data.data;
}

export async function fetchTourSlots(tourId: string) {
  const { data } = await http.get<DetailResponse<TourSlotPublic[]>>(
    `/tours/${tourId}/slots`,
  );
  return data.data;
}

export async function createBooking(payload: BookingCreatePayload) {
  const { data } = await http.post<DetailResponse<BookingCreatedPublic>>(
    '/bookings',
    payload,
  );
  return data.data;
}

export async function fetchBookings(params?: { status?: string; page?: number; limit?: number }) {
  const { data } = await http.get<ListResponse<BookingPublic>>('/bookings', { params });
  return data;
}

export async function fetchBookingDetail(bookingId: string) {
  const { data } = await http.get<DetailResponse<BookingDetail>>(`/bookings/${bookingId}`);
  return data.data;
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const { data } = await http.post<DetailResponse<BookingCancelledPublic>>(
    `/bookings/${bookingId}/cancel`,
    { reason: reason ?? null },
  );
  return data.data;
}

export async function confirmMockPayment(bookingId: string) {
  const { data } = await http.post<DetailResponse<MockPaymentPublic>>(
    `/bookings/${bookingId}/mock-payment/confirm`,
  );
  return data.data;
}

export async function refundMockPayment(bookingId: string) {
  const { data } = await http.post<DetailResponse<MockPaymentPublic>>(
    `/bookings/${bookingId}/mock-payment/refund`,
  );
  return data.data;
}

export async function createTourReview(
  tourId: string,
  payload: { rating: number; text: string; booking_id: string; accessibility_rating?: number },
) {
  const { data } = await http.post(`/tours/${tourId}/reviews`, payload);
  return data;
}

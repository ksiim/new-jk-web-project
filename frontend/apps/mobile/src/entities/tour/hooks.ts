import { useMutation, useQuery } from '@tanstack/react-query';

import {
  cancelBooking,
  confirmMockPayment,
  createBooking,
  createTourReview,
  fetchBookingDetail,
  fetchBookings,
  fetchTour,
  fetchTours,
  fetchTourSlots,
  refundMockPayment,
} from './api';

export function useTours(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['tours', 'list', params],
    queryFn: () => fetchTours(params),
    staleTime: 60_000,
  });
}

export function useTour(tourId: string | null) {
  return useQuery({
    queryKey: ['tours', 'detail', tourId],
    queryFn: () => fetchTour(tourId as string),
    enabled: Boolean(tourId),
    staleTime: 60_000,
  });
}

export function useTourSlots(tourId: string | null) {
  return useQuery({
    queryKey: ['tours', 'slots', tourId],
    queryFn: () => fetchTourSlots(tourId as string),
    enabled: Boolean(tourId),
    staleTime: 30_000,
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: createBooking,
  });
}

export function useBookings(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['bookings', 'list', params],
    queryFn: () => fetchBookings(params),
    staleTime: 30_000,
  });
}

export function useBookingDetail(bookingId: string | null) {
  return useQuery({
    queryKey: ['bookings', 'detail', bookingId],
    queryFn: () => fetchBookingDetail(bookingId as string),
    enabled: Boolean(bookingId),
    staleTime: 30_000,
  });
}

export function useCancelBooking() {
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      cancelBooking(bookingId, reason),
  });
}

export function useConfirmMockPayment() {
  return useMutation({
    mutationFn: (bookingId: string) => confirmMockPayment(bookingId),
  });
}

export function useRefundMockPayment() {
  return useMutation({
    mutationFn: (bookingId: string) => refundMockPayment(bookingId),
  });
}

export function useCreateTourReview() {
  return useMutation({
    mutationFn: ({
      tourId,
      rating,
      text,
      bookingId,
      accessibilityRating,
    }: {
      tourId: string;
      rating: number;
      text: string;
      bookingId: string;
      accessibilityRating?: number;
    }) =>
      createTourReview(tourId, {
        rating,
        text,
        booking_id: bookingId,
        accessibility_rating: accessibilityRating,
      }),
  });
}

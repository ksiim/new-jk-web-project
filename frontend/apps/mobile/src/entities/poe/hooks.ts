import { useQuery } from '@tanstack/react-query';

import { fetchPoeDetail, fetchPoes } from './api';
import type { PoeQuery } from './types';

export function usePoes(query: PoeQuery) {
  return useQuery({
    queryKey: ['poe', 'list', query],
    queryFn: () => fetchPoes(query),
    staleTime: 60_000,
  });
}

export function usePoeDetail(poeId: string | null) {
  return useQuery({
    queryKey: ['poe', 'detail', poeId],
    queryFn: () => fetchPoeDetail(poeId as string),
    enabled: Boolean(poeId),
    staleTime: 60_000,
  });
}

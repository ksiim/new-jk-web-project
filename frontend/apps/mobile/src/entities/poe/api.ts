import { http } from '../../shared/api/http';
import type {
  DetailResponse,
  ListResponse,
  PoeDetail,
  PoePublic,
  PoeQuery,
  PoeReviewCreate,
} from './types';

export async function fetchPoes(query: PoeQuery): Promise<ListResponse<PoePublic>> {
  const { data } = await http.get<ListResponse<PoePublic>>('/poe', { params: query });
  return data;
}

export async function fetchPoeDetail(poeId: string): Promise<PoeDetail> {
  const { data } = await http.get<DetailResponse<PoeDetail>>(`/poe/${poeId}`);
  return data.data;
}

export async function createPoeReview(poeId: string, payload: PoeReviewCreate) {
  const { data } = await http.post(`/poes/${poeId}/reviews`, payload);
  return data;
}

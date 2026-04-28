import { http } from '../../shared/api/http';
import type { DetailResponse, RouteGenerateRequest, RouteGeneratedPublic } from './types';

export async function generateRoute(payload: RouteGenerateRequest) {
  const endpoints = ['/routes/generate', '/routes/generate/', '/route/generate'];
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const { data } = await http.post<DetailResponse<RouteGeneratedPublic>>(endpoint, payload);
      return data.data;
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      // Business 404 from generator (e.g. no POE candidates) should be surfaced as-is.
      if (status === 404 && typeof detail === 'string' && detail !== 'Not Found') {
        throw error;
      }
      // If endpoint exists but request fails for business/validation/auth reasons,
      // stop retries immediately and surface the real backend error.
      if (status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
}

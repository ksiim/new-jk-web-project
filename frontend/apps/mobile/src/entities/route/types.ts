export type RoutePace = 'slow' | 'medium' | 'fast';

export type RouteGenerateRequest = {
  city_id: string;
  interests: string[];
  start_location: {
    lat: number;
    lng: number;
    address?: string | null;
  };
  duration_minutes: number;
  pace: RoutePace;
  budget_level: string;
  accessibility: {
    wheelchair_required: boolean;
    avoid_stairs: boolean;
    need_rest_points: boolean;
  };
};

export type RoutePointPublic = {
  order: number;
  poe_id: string;
  planned_stop_minutes: number;
};

export type RouteGeneratedPublic = {
  id: string;
  title: string;
  description: string;
  city_id: string;
  status: 'draft' | 'saved' | 'in_progress' | 'completed' | 'archived';
  source: 'generated' | 'manual';
  duration_minutes: number;
  distance_meters: number;
  pace: RoutePace;
  points: RoutePointPublic[];
  accessibility_score: number;
};

export type DetailResponse<T> = {
  data: T;
  meta: Record<string, unknown>;
  error: null;
};

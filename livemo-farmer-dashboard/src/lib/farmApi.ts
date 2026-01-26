import { apiFetch } from "@/lib/apiClient";
import type { Alert } from "@/lib/alertApi";

export type Farm = {
  id: number;
  name: string;
  location: string;
  description?: string | null;
};

export type LaravelPaginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type FarmDashboardStats = {
  total_animals: number;
  healthy_animals: number;
  sick_animals: number;
  active_sensors: number;
  pending_alerts: number;
  pasture_count: number;
  needs_attention_animals?: number;
  active_alerts?: number;
  alerts_by_severity?: Record<string, number>;
  sensors_total?: number;
  sensors_online?: number;
  sensors_online_percent?: number;
  last_sensor_seen_at?: string | null;
  tasks?: {
    feedings_due_today?: number;
    pasture_rotations_due_7d?: number;
    vaccinations_due_30d?: number;
  };
};

export type FarmDashboardHealthByCategory = {
  type: string;
  total_animals: number;
  healthy_animals: number;
  avg_health_score: number | null;
};

export type FarmDashboardResponse = {
  generated_at: string;
  farm: Farm;
  statistics: FarmDashboardStats;
  recent_alerts: Alert[];
  health_by_category: FarmDashboardHealthByCategory[];
};

export async function listFarms() {
  return apiFetch<LaravelPaginator<Farm> | Farm[]>("/farms", { method: "GET" });
}

export async function getFarmDashboard(farmId: number) {
  return apiFetch<FarmDashboardResponse>(`/farms/${farmId}/dashboard`, { method: "GET" });
}

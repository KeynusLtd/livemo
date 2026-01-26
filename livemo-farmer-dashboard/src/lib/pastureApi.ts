import { apiFetch, jsonBody } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type Pasture = {
  id: number;
  farm_id: number;
  name: string;
  description?: string | null;
  size: number;
  capacity: number;
  quality?: string | null;
  last_rotation?: string | null;
  next_rotation?: string | null;
  notes?: string | null;
  is_active: boolean;
  current_animals_count?: number;
};

export async function listPastures(params: { farmId: number; page?: number; is_active?: boolean }) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (typeof params.is_active === "boolean") qs.set("is_active", String(params.is_active));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<Pasture>>(`/farms/${params.farmId}/pastures${suffix}`, {
    method: "GET",
  });
}

export async function createPasture(params: {
  farmId: number;
  payload: {
    name: string;
    description?: string;
    size: number;
    capacity: number;
    quality?: string;
    last_rotation?: string;
    next_rotation?: string;
    notes?: string;
    is_active?: boolean;
  };
}) {
  return apiFetch<{ message: string; pasture: Pasture }>(`/farms/${params.farmId}/pastures`, {
    method: "POST",
    body: jsonBody(params.payload),
  });
}

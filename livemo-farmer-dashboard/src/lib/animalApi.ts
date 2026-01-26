import { apiFetch } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type AnimalStatus = "healthy" | "sick" | "quarantine" | "deceased" | "sold";

export type Animal = {
  id: number;
  tag_id: string;
  name?: string | null;
  type: string;
  status: AnimalStatus;
  health_score?: number | null;
};

export type AnimalHealthResponse = {
  animal: Animal;
  health_records: LaravelPaginator<{
    id: number;
    animal_id: number;
    record_type: string;
    temperature?: number | null;
    heart_rate?: number | null;
    activity_level?: number | null;
    severity?: string;
    created_at?: string;
  }>;
  current_health_score: number | null;
  needs_attention: boolean;
};

export async function listAnimals(params: {
  page?: number;
  farm_id?: number;
  type?: string;
  status?: string;
  search?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.farm_id) qs.set("farm_id", String(params.farm_id));
  if (params.type) qs.set("type", params.type);
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);

  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<Animal>>(`/animals${suffix}`, { method: "GET" });
}

export async function getAnimalHealth(params: { animalId: number; page?: number }) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";

  return apiFetch<AnimalHealthResponse>(`/animals/${params.animalId}/health${suffix}`, {
    method: "GET",
  });
}

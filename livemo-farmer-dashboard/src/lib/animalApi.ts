import { apiFetch, jsonBody } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type AnimalStatus = "healthy" | "sick" | "quarantine" | "deceased" | "sold";

export type AnimalCatalog = {
  id: number;
  name: string;
  type: string;
  breed?: string | null;
  default_gender?: "male" | "female" | null;
  is_active: boolean;
};

export type Animal = {
  id: number;
  catalog_id?: number | null;
  tag_id: string;
  name?: string | null;
  type: string;
  status: AnimalStatus;
  health_score?: number | null;
  breed?: string | null;
  gender?: "male" | "female" | null;
  birth_date?: string | null;
  weight?: number | null;
  color?: string | null;
  markings?: string | null;
  mother?: { id: number; tag_id: string; name?: string | null } | null;
  father?: { id: number; tag_id: string; name?: string | null } | null;
  sensors?: Array<{
    id: number;
    device_id: string;
    type: string;
    battery_level?: number | null;
    last_communication?: string | null;
  }>;
  vaccinations?: Array<{
    id: number;
    vaccine_name: string;
    administered_date: string;
    next_due_date?: string | null;
    administered_by?: string | null;
    notes?: string | null;
  }>;
  catalog?: AnimalCatalog | null;
};

export async function listAnimalCatalogs(params?: { page?: number; type?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.type) qs.set("type", params.type);
  if (params?.search) qs.set("search", params.search);
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<AnimalCatalog>>(`/animal-catalogs${suffix}`, { method: "GET" });
}

export async function listAnimalCatalogTypes() {
  return apiFetch<{ types: string[] }>(`/animal-catalogs/types`, { method: "GET" });
}

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

export async function getAnimal(params: { animalId: number }) {
  return apiFetch<Animal>(`/animals/${params.animalId}`, { method: "GET" });
}

export async function createAnimal(payload: {
  farm_id: number;
  catalog_id: number;
  tag_id: string;
  name?: string | null;
  status?: AnimalStatus;
  gender?: "male" | "female" | null;
  birth_date?: string | null;
  weight?: number | null;
  color?: string | null;
  markings?: string | null;
  mother_id?: number | null;
  father_id?: number | null;
}) {
  return apiFetch<{ message: string; animal: Animal }>(`/animals`, {
    method: "POST",
    body: jsonBody(payload),
  });
}

export async function updateAnimal(payload: {
  animalId: number;
  name?: string | null;
  status?: AnimalStatus;
  breed?: string | null;
  weight?: number | null;
  color?: string | null;
  markings?: string | null;
  health_score?: number | null;
}) {
  const { animalId, ...body } = payload;
  return apiFetch<{ message: string; animal: Animal }>(`/animals/${animalId}`, {
    method: "PUT",
    body: jsonBody(body),
  });
}

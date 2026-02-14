import { apiFetch } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type BreedingRecord = {
  id: number;
  farm_id: number;
  mother_id: number;
  father_id?: number | null;
  method: string;
  breeding_date: string;
  expected_birth_date?: string | null;
  actual_birth_date?: string | null;
  status?: string | null;
  pregnancy_days?: number | null;
  is_successful?: boolean | null;
  offspring_count?: number | null;
  offspring_ids?: number[] | null;
  complications?: string | null;
  notes?: string | null;
  mother?: { id: number; tag_id: string; name?: string | null };
  father?: { id: number; tag_id: string; name?: string | null } | null;
  created_at?: string;
  updated_at?: string;
};

export async function listAnimalBreedingRecords(params: { animalId: number; page?: number }) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";

  return apiFetch<LaravelPaginator<BreedingRecord>>(
    `/animals/${params.animalId}/breeding-records${suffix}`,
    { method: "GET" }
  );
}

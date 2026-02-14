import { apiFetch, jsonBody } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type Vaccination = {
  id: number;
  animal_id: number;
  vaccine_name: string;
  vaccine_type?: string | null;
  batch_number?: string | null;
  administered_date: string;
  next_due_date?: string | null;
  administered_by?: string | null;
  dosage?: number | null;
  dosage_unit?: string | null;
  administration_route?: string | null;
  side_effects?: string | null;
  notes?: string | null;
  is_booster?: boolean;
  previous_vaccination_id?: number | null;
  created_at?: string;
  updated_at?: string;
};

export async function listAnimalVaccinations(params: { animalId: number; page?: number }) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";

  return apiFetch<LaravelPaginator<Vaccination>>(`/animals/${params.animalId}/vaccinations${suffix}`, {
    method: "GET",
  });
}

export async function createAnimalVaccination(payload: {
  animalId: number;
  vaccine_name: string;
  vaccine_type?: string | null;
  batch_number?: string | null;
  administered_date: string;
  next_due_date?: string | null;
  administered_by?: string | null;
  dosage?: number | null;
  dosage_unit?: string | null;
  administration_route?: string | null;
  side_effects?: string | null;
  notes?: string | null;
  is_booster?: boolean;
  previous_vaccination_id?: number | null;
}) {
  const { animalId, ...body } = payload;
  return apiFetch<{ message: string; vaccination: Vaccination }>(
    `/animals/${animalId}/vaccinations`,
    {
      method: "POST",
      body: jsonBody(body),
    }
  );
}

export async function updateVaccination(payload: {
  vaccinationId: number;
  vaccine_name?: string;
  vaccine_type?: string | null;
  batch_number?: string | null;
  administered_date?: string;
  next_due_date?: string | null;
  administered_by?: string | null;
  dosage?: number | null;
  dosage_unit?: string | null;
  administration_route?: string | null;
  side_effects?: string | null;
  notes?: string | null;
  is_booster?: boolean;
  previous_vaccination_id?: number | null;
}) {
  const { vaccinationId, ...body } = payload;
  return apiFetch<{ message: string; vaccination: Vaccination }>(`/vaccinations/${vaccinationId}`, {
    method: "PUT",
    body: jsonBody(body),
  });
}

export async function deleteVaccination(vaccinationId: number) {
  return apiFetch<{ message: string }>(`/vaccinations/${vaccinationId}`, {
    method: "DELETE",
  });
}

import { apiFetch, jsonBody } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type HealthSeverity = "normal" | "mild" | "moderate" | "severe" | "critical";

export type HealthRecord = {
  id: number;
  animal_id: number;
  record_type: string;
  temperature?: number | null;
  heart_rate?: number | null;
  respiratory_rate?: number | null;
  activity_level?: number | null;
  diagnosis?: string | null;
  symptoms?: string | null;
  treatment?: string | null;
  notes?: string | null;
  veterinarian?: string | null;
  severity: HealthSeverity;
  created_at?: string;
  animal?: { id: number; tag_id: string; name?: string | null; type: string };
};

export type HealthAnalytics = {
  total_records: number;
  critical_cases: number;
  recent_checkups: number;
};

export async function listHealthRecords(params: {
  page?: number;
  animal_id?: number;
  severity?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.animal_id) qs.set("animal_id", String(params.animal_id));
  if (params.severity) qs.set("severity", params.severity);
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<HealthRecord>>(`/health-records${suffix}`, { method: "GET" });
}

export async function getHealthAnalytics(params: { farm_id?: number }) {
  const qs = new URLSearchParams();
  if (params.farm_id) qs.set("farm_id", String(params.farm_id));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<HealthAnalytics>(`/health/analytics${suffix}`, { method: "GET" });
}

export async function createHealthRecord(payload: Omit<HealthRecord, "id">) {
  return apiFetch<{ message: string; record: HealthRecord }>("/health-records", {
    method: "POST",
    body: jsonBody(payload),
  });
}

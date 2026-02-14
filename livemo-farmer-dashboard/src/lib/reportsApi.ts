import { apiFetch, apiFetchRaw } from "@/lib/apiClient";

export type HealthReport = {
  generated_at: string;
  farm_id: number;
  range: { from: string; to: string };
  summary: {
    total_records: number;
    by_severity: Record<string, number>;
    by_animal_type: Record<string, number>;
  };
  latest_critical: unknown[];
};

export type OperationsReport = {
  generated_at: string;
  farm_id: number;
  window_days: number;
  summary: {
    feedings_completed: number;
    feedings_pending: number;
    pastures_active: number;
    pasture_rotations_due_7d: number;
    breeding_due_births_30d: number;
  };
};

export type FinancialReport = {
  generated_at: string;
  farm_id: number;
  range: { from: string; to: string };
  summary: {
    marketplace_orders: number;
    marketplace_revenue_total: number;
  };
  notes?: string;
};

export async function getHealthReport(params: { farmId: number; from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<HealthReport>(`/farms/${params.farmId}/reports/health${suffix}`, { method: "GET" });
}

export async function getOperationsReport(params: { farmId: number; days?: number }) {
  const qs = new URLSearchParams();
  if (params.days) qs.set("days", String(params.days));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<OperationsReport>(`/farms/${params.farmId}/reports/operations${suffix}`, { method: "GET" });
}

export async function getFinancialReport(params: { farmId: number; from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<FinancialReport>(`/farms/${params.farmId}/reports/financial${suffix}`, { method: "GET" });
}

export type ExportFormat = "json" | "csv" | "pdf";

export async function exportHealthReport(params: {
  farmId: number;
  from?: string;
  to?: string;
  format: ExportFormat;
}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  qs.set("format", params.format);
  const suffix = `?${qs.toString()}`;
  return apiFetchRaw(`/farms/${params.farmId}/export/health${suffix}`, { method: "GET" });
}

export async function exportOperationsReport(params: { farmId: number; days?: number; format: ExportFormat }) {
  const qs = new URLSearchParams();
  if (params.days) qs.set("days", String(params.days));
  qs.set("format", params.format);
  const suffix = `?${qs.toString()}`;
  return apiFetchRaw(`/farms/${params.farmId}/export/operations${suffix}`, { method: "GET" });
}

export async function exportFinancialReport(params: {
  farmId: number;
  from?: string;
  to?: string;
  format: ExportFormat;
}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  qs.set("format", params.format);
  const suffix = `?${qs.toString()}`;
  return apiFetchRaw(`/farms/${params.farmId}/export/financial${suffix}`, { method: "GET" });
}

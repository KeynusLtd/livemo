import { apiFetch, jsonBody } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type Alert = {
  id: number;
  farm_id: number;
  animal_id?: number | null;
  sensor_id?: number | null;
  type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  created_at?: string;
  animal?: { id: number; tag_id: string; name?: string | null; type: string } | null;
  sensor?: { id: number; device_id: string; type: string } | null;
};

export type AlertStats = {
  total: number;
  pending: number;
  critical: number;
  by_type: Record<string, number>;
};

export async function listAlerts(params: {
  page?: number;
  farm_id?: number;
  status?: string;
  severity?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.farm_id) qs.set("farm_id", String(params.farm_id));
  if (params.status) qs.set("status", params.status);
  if (params.severity) qs.set("severity", params.severity);

  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<Alert>>(`/alerts${suffix}`, { method: "GET" });
}

export async function getAlertStats(params: { farm_id?: number }) {
  const qs = new URLSearchParams();
  if (params.farm_id) qs.set("farm_id", String(params.farm_id));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<AlertStats>(`/alerts/stats${suffix}`, { method: "GET" });
}

export async function acknowledgeAlert(alertId: number) {
  return apiFetch<{ message: string; alert: Alert }>(`/alerts/${alertId}/acknowledge`, { method: "PUT" });
}

export async function resolveAlert(payload: { alertId: number; resolution_notes?: string }) {
  return apiFetch<{ message: string; alert: Alert }>(`/alerts/${payload.alertId}/resolve`, {
    method: "PUT",
    body: jsonBody({ resolution_notes: payload.resolution_notes }),
  });
}

export async function createAlertAction(payload: {
  alertId: number;
  action_type: string;
  notes?: string;
  metadata?: unknown;
}) {
  return apiFetch<{ message: string; action: unknown }>(`/alerts/${payload.alertId}/actions`, {
    method: "POST",
    body: jsonBody({
      action_type: payload.action_type,
      notes: payload.notes,
      metadata: payload.metadata,
    }),
  });
}

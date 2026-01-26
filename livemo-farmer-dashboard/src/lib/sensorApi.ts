import { apiFetch, jsonBody } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type Sensor = {
  id: number;
  device_id: string;
  type: string;
  farm_id: number;
  animal_id?: number | null;
  status: string;
  battery_level?: number | null;
  last_communication?: string | null;
  animal?: { id: number; tag_id: string; name?: string | null; type: string } | null;
};

export type SensorReading = {
  id: number;
  sensor_id: number;
  farm_id?: number;
  animal_id?: number | null;
  recorded_at: string;
  temperature?: number | null;
  heart_rate?: number | null;
  activity_level?: number | null;
  battery_level?: number | null;
};

export async function listSensors(params: { page?: number; farm_id?: number; status?: string }) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.farm_id) qs.set("farm_id", String(params.farm_id));
  if (params.status) qs.set("status", params.status);
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<Sensor>>(`/sensors${suffix}`, { method: "GET" });
}

export async function createSensor(payload: {
  device_id: string;
  type: string;
  farm_id: number;
  animal_id?: number;
  configuration?: unknown;
}) {
  return apiFetch<{ message: string; sensor: Sensor }>("/sensors", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export async function getSensorReadings(params: {
  sensorId: number;
  from?: string;
  to?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<{ sensor: Sensor; count: number; readings: SensorReading[] }>(
    `/sensors/${params.sensorId}/readings${suffix}`,
    { method: "GET" }
  );
}

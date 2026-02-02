import { apiFetch, jsonBody } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type FeedSchedule = {
  id: number;
  farm_id: number;
  animal_id?: number | null;
  group_name?: string | null;
  feed_type: string;
  quantity: number;
  scheduled_time: string;
  days_of_week?: number[] | null;
  is_recurring?: boolean;
  is_completed: boolean;
  completed_at?: string | null;
  notes?: string | null;
  animal?: { id: number; tag_id: string; name?: string | null; type: string } | null;
  completed_by?: { id: number; name: string } | null;
};

export async function listFeedSchedules(params: {
  farmId: number;
  page?: number;
  is_completed?: boolean;
  animal_id?: number;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (typeof params.is_completed === "boolean") qs.set("is_completed", String(params.is_completed));
  if (params.animal_id) qs.set("animal_id", String(params.animal_id));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<FeedSchedule>>(
    `/farms/${params.farmId}/feed-schedules${suffix}`,
    { method: "GET" }
  );
}

export async function createFeedSchedule(params: {
  farmId: number;
  payload: {
    animal_id?: number | null;
    group_name?: string | null;
    feed_type: string;
    quantity: number;
    scheduled_time: string;
    days_of_week?: number[] | null;
    is_recurring?: boolean;
    notes?: string | null;
  };
}) {
  return apiFetch<{ message: string; feed_schedule: FeedSchedule }>(
    `/farms/${params.farmId}/feed-schedules`,
    { method: "POST", body: jsonBody(params.payload) }
  );
}

export async function completeFeedSchedule(params: { farmId: number; feedScheduleId: number }) {
  return apiFetch<{ message: string; feed_schedule: FeedSchedule }>(
    `/farms/${params.farmId}/feed-schedules/${params.feedScheduleId}/complete`,
    { method: "POST" }
  );
}

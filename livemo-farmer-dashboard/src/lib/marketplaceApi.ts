import { apiFetch } from "@/lib/apiClient";
import type { LaravelPaginator } from "@/lib/farmApi";

export type Listing = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  views_count?: number;
  created_at?: string;
  listable_type?: string;
  listable?: unknown;
};

export type Order = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at?: string;
};

export type Earnings = {
  range: { from: string; to: string };
  orders_count: number;
  revenue_total: number;
  orders_by_status: Record<string, number>;
  orders_by_payment_status: Record<string, number>;
};

export async function listFarmListings(params: { farmId: number; page?: number; status?: string; type?: string }) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.status) qs.set("status", params.status);
  if (params.type) qs.set("type", params.type);
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<Listing>>(`/farms/${params.farmId}/listings${suffix}`, { method: "GET" });
}

export async function listFarmOrders(params: {
  farmId: number;
  page?: number;
  status?: string;
  payment_status?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.status) qs.set("status", params.status);
  if (params.payment_status) qs.set("payment_status", params.payment_status);
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<LaravelPaginator<Order>>(`/farms/${params.farmId}/orders${suffix}`, { method: "GET" });
}

export async function getFarmEarnings(params: { farmId: number; from?: string; to?: string; days?: number }) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.days) qs.set("days", String(params.days));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<Earnings>(`/farms/${params.farmId}/earnings${suffix}`, { method: "GET" });
}

export async function getSellerRevenueTrend(params: { days?: number }) {
  const qs = new URLSearchParams();
  if (params.days) qs.set("days", String(params.days));
  const suffix = qs.toString().length > 0 ? `?${qs.toString()}` : "";
  return apiFetch<{ days: number; points: Array<{ day: string; revenue: number }> }>(
    `/marketplace/seller/insights/revenue-trend${suffix}`,
    { method: "GET" }
  );
}

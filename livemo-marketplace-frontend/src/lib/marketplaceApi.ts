import { apiRequest } from "./apiClient";

export type ListingType = "livestock" | "product";

export type SellerInfo = {
  id: string;
  farmName: string;
  profileUrl?: string;
  location?: string;
};

export type Listing = {
  id: string;
  type: ListingType;
  title: string;
  price: number;
  location?: string;
  imageUrl?: string;
  description?: string;
  certifications?: string[];
  ageMonths?: number;
  seller?: SellerInfo;
  currency?: string;
};

export type LivestockQuery = {
  type?: string;
  minAge?: number;
  maxAge?: number;
  gender?: string;
  minWeight?: number;
  maxWeight?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  certification?: string;
  availability?: string;
  sort?: string;
};

export type ProductQuery = {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
};

type MaybeListResponse<T> =
  | T[]
  | { data: T[] }
  | { items: T[] }
  | { results: T[] }
  | { listings: T[] }
  | { payload: T[] }
  | { data: { items: T[] } };

function toQueryString(query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function fetchLivestock(query: LivestockQuery) {
  const res = await apiRequest<MaybeListResponse<Listing>>(
    `/marketplace/livestock${toQueryString(query as any)}`
  );
  return normalizeListResponse(res);
}

export async function fetchProducts(query: ProductQuery) {
  const queryWithType = { ...query, type: 'product' };
  const res = await apiRequest<MaybeListResponse<Listing>>(
    `/marketplace/listings${toQueryString(queryWithType as any)}`
  );
  return normalizeListResponse(res);
}

export async function fetchListing(id: string) {
  return apiRequest<Listing>(`/marketplace/listings/${id}`);
}

function normalizeListResponse<T>(res: MaybeListResponse<T>): T[] {
  if (Array.isArray(res)) return res;

  if (res && typeof res === "object") {
    const anyRes = res as any;
    if (Array.isArray(anyRes.data)) return anyRes.data;
    if (Array.isArray(anyRes.items)) return anyRes.items;
    if (Array.isArray(anyRes.results)) return anyRes.results;
    if (Array.isArray(anyRes.listings)) return anyRes.listings;
    if (Array.isArray(anyRes.payload)) return anyRes.payload;
    if (anyRes.data && Array.isArray(anyRes.data.items)) return anyRes.data.items;
  }

  return [];
}

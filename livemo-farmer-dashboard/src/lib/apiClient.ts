export type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${base}/${p}`;
}

function getApiBaseUrl() {
  const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (envBase && envBase.trim().length > 0 ? envBase.trim() : "http://localhost:8000/api/v1").replace(/\/+$/, "");
}

async function safeReadJson(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<TResponse> {
  const { auth = true, headers, ...rest } = options;
  const baseUrl = getApiBaseUrl();

  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Accept")) finalHeaders.set("Accept", "application/json");

  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (!isFormData && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const { useAuthStore } = await import("@/stores/authStore");
    const token = useAuthStore.getState().accessToken;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const url = joinUrl(baseUrl, path);
  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  });

  if (!res.ok) {
    const payload = (await safeReadJson(res)) as ApiErrorPayload | undefined;
    const message = payload?.message || `Request failed (${res.status})`;

    if (res.status === 401) {
      const { useAuthStore } = await import("@/stores/authStore");
      useAuthStore.getState().clearSession();
    }

    throw new ApiError(res.status, message, payload);
  }

  const data = (await safeReadJson(res)) as TResponse | undefined;
  return (data ?? (undefined as TResponse));
}

export function jsonBody(body: unknown) {
  return JSON.stringify(body);
}

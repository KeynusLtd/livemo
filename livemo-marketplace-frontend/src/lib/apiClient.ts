export type ApiClientOptions = {
  baseUrl?: string;
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const defaultBaseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

let didLogMockMode = false;

function shouldUseMocks() {
  try {
    return (import.meta as any)?.env?.VITE_USE_MOCKS === "true";
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & ApiClientOptions = {}
): Promise<T> {
  if (shouldUseMocks()) {
    if (!didLogMockMode) {
      didLogMockMode = true;
      // eslint-disable-next-line no-console
      console.log("[Livemo] Mock mode enabled (VITE_USE_MOCKS=true)");
    }
    const { mockApiRequest } = await import("./mockApi");
    return mockApiRequest<T>(path, options);
  }

  const { baseUrl, ...fetchOptions } = options;
  const url = `${baseUrl ?? defaultBaseUrl}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(fetchOptions.headers ?? {}),
      },
      ...fetchOptions,
    });
  } catch (e) {
    const { mockApiRequest } = await import("./mockApi");
    return mockApiRequest<T>(path, options);
  }

  const text = await res.text();
  const body = text ? (safeJsonParse(text) ?? text) : null;

  if (!res.ok) {
    throw new ApiError(`Request failed (${res.status})`, res.status, body);
  }

  return body as T;
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

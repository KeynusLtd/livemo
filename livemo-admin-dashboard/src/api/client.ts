export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export type ApiError = {
    status: number;
    message: string;
    details?: unknown;
};

async function parseJsonSafely(response: Response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit & { token?: string } = {},
): Promise<T> {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    if (options.token) {
        headers.set('Authorization', `Bearer ${options.token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const payload = await parseJsonSafely(response);
        const message =
            (payload && typeof payload === 'object' && 'message' in payload && (payload as any).message) ||
            response.statusText ||
            'Request failed';

        const err: ApiError = {
            status: response.status,
            message,
            details: payload,
        };
        throw err;
    }

    return (await parseJsonSafely(response)) as T;
}

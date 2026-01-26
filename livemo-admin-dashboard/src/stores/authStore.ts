import { create } from 'zustand';
import { apiRequest } from '../api/client';

export type AuthUser = {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
};

type LoginResponse = {
    user: AuthUser;
    access_token: string;
    token_type: string;
    message?: string;
};

type MeResponse = {
    user: AuthUser;
};

type AuthState = {
    token: string | null;
    user: AuthUser | null;
    hydrated: boolean;
    hydrate: () => void;
    login: (email: string, password: string) => Promise<void>;
    fetchMe: () => Promise<AuthUser>;
    logout: () => void;
};

const TOKEN_KEY = 'livemo_admin_token';

export const useAuthStore = create<AuthState>((set, get) => ({
    token: null,
    user: null,
    hydrated: false,

    hydrate: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        set({ token: token ?? null, hydrated: true });
    },

    login: async (email: string, password: string) => {
        const res = await apiRequest<LoginResponse>('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        localStorage.setItem(TOKEN_KEY, res.access_token);
        set({ token: res.access_token, user: res.user });
    },

    fetchMe: async () => {
        const token = get().token;
        if (!token) {
            throw new Error('Not authenticated');
        }

        const res = await apiRequest<MeResponse>('/me', {
            method: 'GET',
            token,
        });

        set({ user: res.user });
        return res.user;
    },

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ token: null, user: null });
    },
}));

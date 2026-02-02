import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (payload: { user: AuthUser; accessToken: string }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: ({ user, accessToken }) => set({ user, accessToken }),
      clearSession: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "livemo_farmer_auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);

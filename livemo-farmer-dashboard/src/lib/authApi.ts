import { apiFetch, jsonBody } from "@/lib/apiClient";
import type { AuthUser } from "@/stores/authStore";

type AuthResponse = {
  message: string;
  user: AuthUser;
  access_token: string;
  token_type: "Bearer";
};

export async function login(payload: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/login", {
    method: "POST",
    body: jsonBody(payload),
    auth: false,
  });
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}) {
  return apiFetch<AuthResponse>("/register", {
    method: "POST",
    body: jsonBody(payload),
    auth: false,
  });
}

export async function me() {
  return apiFetch<{ user: AuthUser }>("/me", { method: "GET" });
}

export async function logout() {
  return apiFetch<{ message: string }>("/logout", { method: "POST" });
}

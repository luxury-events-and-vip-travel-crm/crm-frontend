import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "../stores/auth";

type Envelope<T> = {
  success: boolean;
  data: T;
  message: string;
  errors: unknown;
};

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInFlight: Promise<{ access: string; refresh?: string } | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    if (!original) throw error;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { refreshToken, setTokens, clear } = useAuthStore.getState();
      if (!refreshToken) {
        clear();
        throw error;
      }

      refreshInFlight ??= (async () => {
        try {
          const resp = await axios.post<Envelope<{ access: string; refresh?: string }>>(
            `${baseURL}/auth/refresh/`,
            { refresh: refreshToken },
            { headers: { "Content-Type": "application/json" } },
          );
          if (!resp.data.success) return null;
          return resp.data.data;
        } catch {
          return null;
        } finally {
          refreshInFlight = null;
        }
      })();

      const tokens = await refreshInFlight;
      if (!tokens?.access) {
        clear();
        throw error;
      }

      setTokens(tokens);
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${tokens.access}`;
      return api.request(original);
    }

    throw error;
  },
);

export async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  const resp = await promise;
  if (!resp.data.success) {
    throw new Error(resp.data.message || "Request failed");
  }
  return resp.data.data;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { authApi } from "../api/auth";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: { access: string; refresh?: string }) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (tokens) =>
        set((s) => ({
          accessToken: tokens.access,
          refreshToken: tokens.refresh ?? s.refreshToken,
        })),
      login: async (username, password) => {
        const tokens = await authApi.login(username, password);
        set({ accessToken: tokens.access, refreshToken: tokens.refresh });
      },
      logout: async () => {
        const refresh = get().refreshToken;
        if (refresh) {
          try {
            await authApi.logout(refresh);
          } catch {
            // ignore
          }
        }
        set({ accessToken: null, refreshToken: null });
      },
      clear: () => set({ accessToken: null, refreshToken: null }),
    }),
    { name: "crm-auth" },
  ),
);

import { api, unwrap } from "./client";

export const authApi = {
  login: (username: string, password: string) =>
    unwrap<{ access: string; refresh: string }>(
      api.post("/auth/login/", { username, password }),
    ),
  logout: (refresh: string) => unwrap<null>(api.post("/auth/logout/", { refresh })),
};

import { api, unwrap } from "./client";
import type { Paginated } from "./crm";

export type ActivityLog = {
  id: string;
  user: number | null;
  user_username: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  model_name: string;
  object_id: string;
  timestamp: string;
};

export const activityApi = {
  list: (params: { page?: number; search?: string } = {}) =>
    unwrap<Paginated<ActivityLog>>(api.get("/activity-logs/", { params })),
};

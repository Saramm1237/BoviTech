import { apiClient } from "./client";
import type { DashboardData } from "../types/dashboard";

export const dashboardApi = {
  get: () => apiClient.get<DashboardData>("/dashboard"),
};

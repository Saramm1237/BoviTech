import { apiClient } from "./client";
import type { ChangePasswordRequest, LoginRequest, TokenResponse } from "../types/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>("/auth/login", data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post("/auth/change-password", data),
};

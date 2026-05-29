export type Rol = "propietario" | "operario";

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  finca_id: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

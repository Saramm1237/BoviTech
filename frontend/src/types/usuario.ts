import type { Rol } from "./auth";

export interface UsuarioRead {
  id: string;
  finca_id: string;
  email: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
  ver_alertas: boolean;
  created_at: string;
}

export interface UsuarioCreate {
  email: string;
  nombre: string;
  password: string;
  rol: "operario";
}

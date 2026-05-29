import { apiClient } from "./client";
import type { UsuarioCreate, UsuarioRead } from "../types/usuario";

export const usuariosApi = {
  list: () =>
    apiClient.get<UsuarioRead[]>("/usuarios"),

  create: (data: UsuarioCreate) =>
    apiClient.post<UsuarioRead>("/usuarios", data),

  deactivate: (id: string) =>
    apiClient.delete(`/usuarios/${id}`),

  toggleVerAlertas: (id: string) =>
    apiClient.patch<UsuarioRead>(`/usuarios/${id}/ver-alertas`),
};

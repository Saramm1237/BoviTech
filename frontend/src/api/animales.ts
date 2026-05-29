import { apiClient } from "./client";
import type { Animal, AnimalCreate, AnimalUpdate } from "../types/animal";

export const animalesApi = {
  list: (soloActivos = true) =>
    apiClient.get<Animal[]>("/animales", { params: { solo_activos: soloActivos } }),

  get: (id: string) =>
    apiClient.get<Animal>(`/animales/${id}`),

  create: (data: AnimalCreate) =>
    apiClient.post<Animal>("/animales", data),

  update: (id: string, data: AnimalUpdate) =>
    apiClient.patch<Animal>(`/animales/${id}`, data),

  deactivate: (id: string, motivo?: string) =>
    apiClient.delete(`/animales/${id}`, {
      params: motivo ? { baja_motivo: motivo } : undefined,
    }),
};

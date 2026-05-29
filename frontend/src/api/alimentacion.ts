import { apiClient } from "./client";
import type {
  AlimentacionCreate,
  AlimentacionRecord,
  EficienciaData,
  GrupoAlimentacionCreate,
} from "../types/alimentacion";

export const alimentacionApi = {
  list: (params?: { fecha?: string; animal_id?: string }) =>
    apiClient.get<AlimentacionRecord[]>("/alimentacion", { params }),

  create: (data: AlimentacionCreate) =>
    apiClient.post<AlimentacionRecord>("/alimentacion", data),

  createGrupo: (data: GrupoAlimentacionCreate) =>
    apiClient.post<AlimentacionRecord[]>("/alimentacion/grupo", data),
};

export const eficienciaApi = {
  get: (animalId: string, fecha: string) =>
    apiClient.get<EficienciaData>(`/animales/${animalId}/eficiencia`, {
      params: { fecha },
    }),
};

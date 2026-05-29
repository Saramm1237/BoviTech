import { apiClient } from "./client";
import type {
  ProduccionDiaria,
  RegistroProduccion,
  RegistroProduccionCreate,
  Sesion,
  Turno,
} from "../types/produccion";

export const sesionesApi = {
  list: (params: { fecha?: string; turno?: Turno }) =>
    apiClient.get<Sesion[]>("/sesiones", { params }),

  create: (fecha: string, turno: Turno) =>
    apiClient.post<Sesion>("/sesiones", { fecha, turno }),

  getRegistros: (sesionId: string) =>
    apiClient.get<RegistroProduccion[]>(`/sesiones/${sesionId}/registros`),

  addRegistros: (sesionId: string, data: RegistroProduccionCreate[]) =>
    apiClient.post<RegistroProduccion[]>(`/sesiones/${sesionId}/registros`, data),
};

export const produccionApi = {
  getTrend: (animalId: string, periodo = "30d") =>
    apiClient.get<ProduccionDiaria[]>(`/animales/${animalId}/produccion`, {
      params: { periodo },
    }),
};

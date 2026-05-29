import { apiClient } from "./client";
import type { EventoTrazabilidad } from "../types/trazabilidad";

export const trazabilidadApi = {
  getByAnimal: (animalId: string) =>
    apiClient.get<EventoTrazabilidad[]>(`/animales/${animalId}/trazabilidad`),

  exportUrl: (animalId: string): string => {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
    const token = localStorage.getItem("access_token") ?? "";
    return `${base}/trazabilidad/export?animal_id=${animalId}&token=${token}`;
  },
};

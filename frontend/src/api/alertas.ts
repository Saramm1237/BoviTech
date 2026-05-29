import { apiClient } from "./client";
import type { Alerta } from "../types/produccion";

export const alertasApi = {
  list: () =>
    apiClient.get<Alerta[]>("/alertas"),

  ack: (id: string) =>
    apiClient.post<Alerta>(`/alertas/${id}/ack`),

  getConfig: () =>
    apiClient.get<{ umbral_alerta_porcentaje: number }>("/alertas/config"),

  updateConfig: (umbral: number) =>
    apiClient.patch("/alertas/config", { umbral_porcentaje: umbral }),
};

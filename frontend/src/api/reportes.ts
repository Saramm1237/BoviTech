import { apiClient } from "./client";

export interface ReporteRequest {
  tipo: "semanal" | "mensual";
  fecha_inicio: string;
  fecha_fin: string;
}

export interface ReporteJob {
  job_id: string;
  status: "pending" | "ready" | "failed";
}

export const reportesApi = {
  requestPdf: (data: ReporteRequest) =>
    apiClient.post<ReporteJob>("/reportes/pdf", data),

  requestExcel: (data: ReporteRequest) =>
    apiClient.post<ReporteJob>("/reportes/excel", data),

  getStatus: (jobId: string) =>
    apiClient.get<ReporteJob>(`/reportes/${jobId}/status`),

  downloadUrl: (jobId: string): string => {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
    return `${base}/reportes/${jobId}/download`;
  },
};

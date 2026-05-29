export interface EventoTrazabilidad {
  id: string;
  tipo_evento: "ordeno" | "baja" | "alimentacion" | "alta" | string;
  datos_evento: Record<string, unknown>;
  responsable_nombre: string;
  created_at: string;
}

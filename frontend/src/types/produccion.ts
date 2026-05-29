export type Turno = "manana" | "tarde";

export interface Sesion {
  id: string;
  finca_id: string;
  fecha: string;
  turno: Turno;
  operario_id: string;
  created_at: string;
  updated_at: string;
}

export interface RegistroProduccion {
  id: string;
  finca_id: string;
  sesion_id: string;
  animal_id: string;
  fecha: string;
  turno: Turno;
  volumen_litros: number;
  operario_id: string;
  created_at: string;
}

export interface RegistroProduccionCreate {
  animal_id: string;
  volumen_litros: number;
}

export interface ProduccionDiaria {
  fecha: string;
  total_litros: number;
}

export interface Alerta {
  id: string;
  finca_id: string;
  animal_id: string;
  tipo_alerta: "caida_produccion" | "sin_registro_24h";
  nivel: "critico" | "advertencia";
  mensaje: string;
  revisada: boolean;
  fecha_revision: string | null;
  datos_extra: Record<string, unknown> | null;
  created_at: string;
  animal_nombre: string | null;
  animal_numero_arete: string | null;
}

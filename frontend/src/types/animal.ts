export interface Animal {
  id: string;
  numero_arete: string;
  nombre: string | null;
  raza: string | null;
  fecha_nacimiento: string | null;
  fecha_ultimo_parto: string | null;
  activo: boolean;
  baja_fecha: string | null;
  baja_motivo: string | null;
  finca_id: string;
  created_at: string;
  updated_at: string;
}

export interface AnimalCreate {
  numero_arete: string;
  nombre?: string;
  raza?: string;
  fecha_nacimiento?: string;
  fecha_ultimo_parto?: string;
}

export interface AnimalUpdate {
  nombre?: string | null;
  raza?: string | null;
  fecha_nacimiento?: string | null;
  fecha_ultimo_parto?: string | null;
}

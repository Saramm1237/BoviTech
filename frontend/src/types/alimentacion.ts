export type TipoAlimento = "concentrado" | "forraje" | "suplemento";

export interface AlimentacionRecord {
  id: string;
  finca_id: string;
  animal_id: string;
  fecha: string;
  tipo_alimento: TipoAlimento;
  cantidad_kg: number;
  operario_id: string;
  sesion_id: string | null;
  created_at: string;
}

export interface AlimentacionCreate {
  fecha: string;
  animal_id: string;
  tipo_alimento: TipoAlimento;
  cantidad_kg: number;
}

export interface ItemGrupo {
  animal_id: string;
  cantidad_kg: number;
}

export interface GrupoAlimentacionCreate {
  fecha: string;
  animal_ids: string[];
  tipo_alimento: TipoAlimento;
  cantidad_kg_total: number;
  cantidades_individuales?: ItemGrupo[];
}

export interface EficienciaData {
  fecha: string;
  litros_producidos: number | null;
  kg_alimento: number | null;
  eficiencia_litros_por_kg: number | null;
}

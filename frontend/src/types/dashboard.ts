export interface AnimalRankingItem {
  animal_id: string;
  numero_arete: string;
  nombre: string | null;
  litros_hoy: number;
}

export interface DashboardData {
  produccion_hoy_litros: number | null;
  produccion_7_dias_litros: number;
  alertas_activas_count: number;
  top_5_mayor: AnimalRankingItem[];
  top_5_menor: AnimalRankingItem[];
  ultimo_registro_at: string | null;
}

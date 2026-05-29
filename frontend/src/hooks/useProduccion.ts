import { useEffect, useState } from "react";
import { produccionApi } from "../api/produccion";
import type { ProduccionDiaria } from "../types/produccion";

export function useProduccionAnimal(animalId: string | undefined, periodo = "30d") {
  const [data, setData] = useState<ProduccionDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!animalId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    produccionApi
      .getTrend(animalId, periodo)
      .then(({ data }) => setData(data))
      .catch(() => setError("Error al cargar el historial de producción"))
      .finally(() => setLoading(false));
  }, [animalId, periodo]);

  return { data, loading, error };
}

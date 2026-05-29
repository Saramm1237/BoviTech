import { useCallback, useEffect, useState } from "react";
import { alertasApi } from "../api/alertas";
import type { Alerta } from "../types/produccion";

export function useAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await alertasApi.list(true); // incluye revisadas para el toggle
      setAlertas(data);
    } catch {
      setError("Error al cargar las alertas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const ackAlerta = async (id: string) => {
    // Actualización optimista: marcar localmente de inmediato
    setAlertas((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, revisada: true, fecha_revision: new Date().toISOString() }
          : a,
      ),
    );
    try {
      await alertasApi.ack(id);
    } catch {
      fetch(); // Revertir si falla
    }
  };

  return { alertas, loading, error, ackAlerta, refetch: fetch };
}

import { useCallback, useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboard";
import type { DashboardData } from "../types/dashboard";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await dashboardApi.get();
      setData(data);
    } catch {
      setError("Error al cargar el panel. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

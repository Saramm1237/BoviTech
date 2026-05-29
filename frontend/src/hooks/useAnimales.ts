import { useCallback, useEffect, useState } from "react";
import { animalesApi } from "../api/animales";
import type { Animal, AnimalCreate, AnimalUpdate } from "../types/animal";

interface UseAnimalesReturn {
  animales: Animal[];
  loading: boolean;
  error: string | null;
  createAnimal: (data: AnimalCreate) => Promise<Animal>;
  updateAnimal: (id: string, data: AnimalUpdate) => Promise<Animal>;
  deactivateAnimal: (id: string, motivo?: string) => Promise<void>;
  refetch: () => void;
}

export function useAnimales(soloActivos = true): UseAnimalesReturn {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await animalesApi.list(soloActivos);
      setAnimales(data);
    } catch {
      setError("Error al cargar los animales. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [soloActivos]);

  useEffect(() => {
    fetchAnimales();
  }, [fetchAnimales]);

  const createAnimal = async (data: AnimalCreate): Promise<Animal> => {
    const { data: created } = await animalesApi.create(data);
    setAnimales((prev) => [...prev, created].sort((a, b) => a.numero_arete.localeCompare(b.numero_arete)));
    return created;
  };

  const updateAnimal = async (id: string, data: AnimalUpdate): Promise<Animal> => {
    const { data: updated } = await animalesApi.update(id, data);
    setAnimales((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  const deactivateAnimal = async (id: string, motivo?: string): Promise<void> => {
    await animalesApi.deactivate(id, motivo);
    setAnimales((prev) => prev.filter((a) => a.id !== id));
  };

  return { animales, loading, error, createAnimal, updateAnimal, deactivateAnimal, refetch: fetchAnimales };
}

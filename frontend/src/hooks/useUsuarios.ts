import { useCallback, useEffect, useState } from "react";
import { usuariosApi } from "../api/usuarios";
import type { UsuarioCreate, UsuarioRead } from "../types/usuario";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await usuariosApi.list();
      setUsuarios(data);
    } catch {
      setError("Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createUsuario = async (data: UsuarioCreate): Promise<UsuarioRead> => {
    const { data: created } = await usuariosApi.create(data);
    setUsuarios((prev) => [...prev, created]);
    return created;
  };

  const deactivateUsuario = async (id: string): Promise<void> => {
    await usuariosApi.deactivate(id);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleVerAlertas = async (id: string): Promise<void> => {
    const { data: updated } = await usuariosApi.toggleVerAlertas(id);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  return { usuarios, loading, error, createUsuario, deactivateUsuario, toggleVerAlertas, refetch: fetch };
}

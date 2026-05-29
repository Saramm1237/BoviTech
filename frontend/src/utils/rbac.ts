import { useAuth } from "../context/AuthContext";
import type { Rol } from "../types/auth";

type Permiso =
  | "animales.crear"
  | "animales.editar"
  | "animales.desactivar"
  | "usuarios.gestionar"
  | "alertas.configurar"
  | "ordeno.registrar"
  | "alimentacion.registrar"
  | "dashboard.ver"
  | "reportes.exportar";

const PERMISOS: Record<Permiso, Rol[]> = {
  "animales.crear": ["propietario"],
  "animales.editar": ["propietario"],
  "animales.desactivar": ["propietario"],
  "usuarios.gestionar": ["propietario"],
  "alertas.configurar": ["propietario"],
  "ordeno.registrar": ["propietario", "operario"],
  "alimentacion.registrar": ["propietario", "operario"],
  "dashboard.ver": ["propietario", "operario"],
  "reportes.exportar": ["propietario", "operario"],
};

export function useRbac() {
  const { user } = useAuth();
  const can = (permiso: Permiso): boolean => {
    if (!user) return false;
    return PERMISOS[permiso]?.includes(user.rol) ?? false;
  };
  return { can };
}

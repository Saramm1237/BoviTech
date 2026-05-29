import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Rol } from "../../types/auth";

interface RoleRouteProps {
  allowedRoles: Rol[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.rol)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="mb-3 text-4xl">🔒</div>
          <h2 className="mb-2 text-lg font-semibold text-amber-800">
            Acceso restringido
          </h2>
          <p className="text-sm text-amber-700">
            Esta sección es solo para el propietario
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

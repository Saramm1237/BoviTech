import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/common/PrivateRoute";
import { RoleRoute } from "./components/common/RoleRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { AnimalesPage } from "./pages/animals/AnimalesPage";
import { AnimalDetailPage } from "./pages/animals/AnimalDetailPage";
import { RegistroOrdenoPage } from "./pages/production/RegistroOrdenoPage";
import { AlertasPage } from "./pages/alerts/AlertasPage";
import { RegistroAlimentacionPage } from "./pages/feed/RegistroAlimentacionPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/animales" element={<AnimalesPage />} />
            <Route path="/animales/:id" element={<AnimalDetailPage />} />
            <Route path="/sesiones/nueva" element={<RegistroOrdenoPage />} />
            <Route path="/alertas" element={<AlertasPage />} />
            <Route path="/alimentacion/nueva" element={<RegistroAlimentacionPage />} />

            {/* Solo propietario */}
            <Route element={<RoleRoute allowedRoles={["propietario"]} />}>
              <Route
                path="/usuarios"
                element={<div className="p-8 text-gray-500">Gestión de usuarios — próximamente</div>}
              />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { AxiosError } from "axios";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [nombreFinca, setNombreFinca] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Registrar directamente via API y luego login automático
      const { apiClient } = await import("../../api/client");
      const { data } = await apiClient.post("/auth/register", {
        nombre_finca: nombreFinca,
        nombre,
        email,
        password,
      });
      // Guardar tokens igual que el login
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Redirigir al dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const ae = err as AxiosError<{ detail: string }>;
      if (ae.response?.status === 409) {
        setError("Ya existe una cuenta con este email");
      } else {
        setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-2 text-5xl">🐄</div>
          <h1 className="text-2xl font-bold text-green-800">BoviTech</h1>
          <p className="mt-1 text-sm text-gray-500">Crear nueva cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre de la finca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombreFinca}
              onChange={(e) => setNombreFinca(e.target.value)}
              placeholder="Ej: Finca La Esperanza"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tu nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Carlos Pérez"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@finca.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !nombreFinca || !nombre || !email || !password}
            className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-green-700 hover:underline">
              Ingresar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

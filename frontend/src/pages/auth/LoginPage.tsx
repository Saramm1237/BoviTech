import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { AxiosError } from "axios";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      if (axiosErr.response?.status === 401) {
        setError("Email o contraseña incorrectos");
      } else {
        setError("Error de conexión. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo / marca */}
        <div className="mb-8 text-center">
          <div className="mb-2 text-5xl">🐄</div>
          <h1 className="text-2xl font-bold text-green-800">BoviTech</h1>
          <p className="mt-1 text-sm text-gray-500">Gestión lechera inteligente</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="correo@finca.com"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="font-medium text-green-700 hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

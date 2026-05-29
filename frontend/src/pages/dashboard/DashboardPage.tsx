import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../hooks/useDashboard";
import type { AnimalRankingItem } from "../../types/dashboard";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useDashboard();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐄</span>
            <span className="text-lg font-bold text-green-800">BoviTech</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">
              {user?.nombre} · <span className="capitalize text-green-700">{user?.rol}</span>
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <QuickAction icon="☀️" label="Registrar ordeño" onClick={() => navigate("/sesiones/nueva")} color="green" />
          <QuickAction icon="🐄" label="Gestión del hato" onClick={() => navigate("/animales")} color="green" />
          <QuickAction icon="⚠️" label="Alertas" onClick={() => navigate("/alertas")} color="amber" />
          <QuickAction icon="🌾" label="Alimentación" onClick={() => navigate("/alimentacion/nueva")} color="green" />
          <QuickAction icon="👥" label="Usuarios" onClick={() => navigate("/usuarios")} color="green" />
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={refetch} className="ml-auto text-xs underline">Reintentar</button>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : data ? (
          <>
            {/* Métricas principales */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard
                label="Producción hoy"
                value={data.produccion_hoy_litros !== null ? `${data.produccion_hoy_litros.toFixed(1)} L` : null}
                emptyText="Sin registros hoy"
                icon="🥛"
                color="green"
              />
              <MetricCard
                label="Últimos 7 días"
                value={`${data.produccion_7_dias_litros.toFixed(1)} L`}
                icon="📅"
                color="blue"
              />
              <AlertMetricCard
                count={data.alertas_activas_count}
                onClick={() => navigate("/alertas")}
              />
            </div>

            {/* Rankings */}
            {(data.top_5_mayor.length > 0 || data.top_5_menor.length > 0) ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <RankingCard
                  title="🏆 Top 5 — Mayor producción hoy"
                  items={data.top_5_mayor}
                  onAnimalClick={(id) => navigate(`/animales/${id}`)}
                  accent="green"
                />
                <RankingCard
                  title="📉 Top 5 — Menor producción hoy"
                  items={data.top_5_menor}
                  onAnimalClick={(id) => navigate(`/animales/${id}`)}
                  accent="amber"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-400">
                <div className="text-3xl mb-2">🥛</div>
                <p className="text-sm">No hay registros de producción hoy.</p>
                <button
                  onClick={() => navigate("/sesiones/nueva")}
                  className="mt-3 text-sm text-green-700 underline"
                >
                  Registrar primer ordeño
                </button>
              </div>
            )}

            {/* Último registro */}
            {data.ultimo_registro_at && (
              <p className="text-center text-xs text-gray-400">
                Último registro: {new Date(data.ultimo_registro_at).toLocaleString("es-CO")}
              </p>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function QuickAction({
  icon, label, onClick, color, disabled = false,
}: {
  icon: string; label: string; onClick: () => void; color: string; disabled?: boolean;
}) {
  const colors: Record<string, string> = {
    green: "border-green-200 hover:bg-green-50 text-green-800",
    amber: "border-amber-200 hover:bg-amber-50 text-amber-800",
    gray: "border-gray-200 text-gray-400 cursor-not-allowed",
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 rounded-xl border bg-white py-4 shadow-sm transition ${colors[color] ?? colors.gray}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      {disabled && <span className="text-xs text-gray-300">Próximamente</span>}
    </button>
  );
}

function MetricCard({
  label, value, emptyText, icon, color,
}: {
  label: string; value: string | null; emptyText?: string; icon: string; color: string;
}) {
  const accent = color === "green" ? "text-green-700" : "text-blue-700";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      {value !== null ? (
        <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      ) : (
        <p className="text-base font-medium text-gray-400">{emptyText}</p>
      )}
    </div>
  );
}

function AlertMetricCard({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-5 shadow-sm text-left transition hover:opacity-90 w-full ${
        count > 0 ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Alertas activas</span>
        <span className="text-xl">⚠️</span>
      </div>
      <div className="flex items-end gap-2">
        <p className={`text-3xl font-bold ${count > 0 ? "text-red-700" : "text-gray-500"}`}>
          {count}
        </p>
        {count > 0 && (
          <span className="mb-1 text-xs font-semibold text-red-600">Ver →</span>
        )}
      </div>
    </button>
  );
}

function RankingCard({
  title, items, onAnimalClick, accent,
}: {
  title: string; items: AnimalRankingItem[]; onAnimalClick: (id: string) => void; accent: string;
}) {
  const litroColor = accent === "green" ? "text-green-700" : "text-amber-700";
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((item, i) => (
          <li
            key={item.animal_id}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => onAnimalClick(item.animal_id)}
          >
            <span className="text-sm font-bold text-gray-400 w-4">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {item.nombre ?? item.numero_arete}
              </p>
              <p className="text-xs text-gray-500">{item.numero_arete}</p>
            </div>
            <span className={`text-sm font-bold ${litroColor}`}>
              {item.litros_hoy.toFixed(1)} L
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-gray-200" />
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

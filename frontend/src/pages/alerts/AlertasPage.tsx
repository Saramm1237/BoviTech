import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAlertas } from "../../hooks/useAlertas";
import type { Alerta } from "../../types/produccion";

export function AlertasPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alertas, loading, error, ackAlerta } = useAlertas();
  const esPropietario = user?.rol === "propietario";

  const [verRevisadas, setVerRevisadas] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const activas = alertas.filter((a) => !a.revisada);
  const revisadas = alertas.filter((a) => a.revisada);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAck = async (alerta: Alerta) => {
    await ackAlerta(alerta.id);
    showToast("Alerta marcada como revisada");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Panel
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">Alertas</h1>
            {activas.length > 0 && (
              <p className="text-xs text-red-600 font-medium">{activas.length} sin revisar</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-200" />)}
          </div>
        ) : (
          <>
            {/* Alertas activas */}
            {activas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-sm font-medium">Sin alertas activas</p>
                <p className="text-xs mt-1">Tu hato está bajo control</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {activas.map((alerta) => (
                  <AlertCard
                    key={alerta.id}
                    alerta={alerta}
                    esPropietario={esPropietario}
                    onAck={() => handleAck(alerta)}
                    onAnimalClick={() => navigate(`/animales/${alerta.animal_id}`)}
                  />
                ))}
              </ul>
            )}

            {/* Toggle alertas revisadas */}
            <div className="pt-2">
              <button
                onClick={() => setVerRevisadas((v) => !v)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <span>{verRevisadas ? "▲" : "▼"}</span>
                <span>
                  {verRevisadas ? "Ocultar" : "Ver"} alertas revisadas ({revisadas.length})
                </span>
              </button>

              {verRevisadas && revisadas.length > 0 && (
                <ul className="mt-3 space-y-3">
                  {revisadas.map((alerta) => (
                    <AlertCard
                      key={alerta.id}
                      alerta={alerta}
                      esPropietario={false}
                      onAck={() => {}}
                      onAnimalClick={() => navigate(`/animales/${alerta.animal_id}`)}
                      dimmed
                    />
                  ))}
                </ul>
              )}

              {verRevisadas && revisadas.length === 0 && (
                <p className="mt-3 text-center text-sm text-gray-400">
                  No hay alertas revisadas anteriores
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-gray-800 px-4 py-3 text-sm text-white shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

// ── AlertCard ─────────────────────────────────────────────────────────────────

function AlertCard({
  alerta, esPropietario, onAck, onAnimalClick, dimmed = false,
}: {
  alerta: Alerta;
  esPropietario: boolean;
  onAck: () => void;
  onAnimalClick: () => void;
  dimmed?: boolean;
}) {
  const isCritico = alerta.nivel === "critico";
  const borderColor = dimmed
    ? "border-gray-200"
    : isCritico
    ? "border-red-200"
    : "border-amber-200";
  const bgColor = dimmed
    ? "bg-gray-50"
    : isCritico
    ? "bg-red-50"
    : "bg-amber-50";
  const badgeColor = isCritico
    ? "bg-red-600 text-white"
    : "bg-amber-500 text-white";

  const extras = alerta.datos_extra as Record<string, number> | null;

  return (
    <li className={`rounded-xl border p-4 ${borderColor} ${bgColor} ${dimmed ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Badge de nivel */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {!dimmed && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeColor}`}>
                {isCritico ? "CRÍTICO" : "ADVERTENCIA"}
              </span>
            )}
            <button
              onClick={onAnimalClick}
              className="text-sm font-semibold text-gray-800 hover:underline truncate"
            >
              {alerta.animal_nombre
                ? `${alerta.animal_nombre} (${alerta.animal_numero_arete})`
                : alerta.animal_numero_arete ?? "Animal"}
            </button>
          </div>

          {/* Mensaje */}
          {alerta.tipo_alerta === "caida_produccion" && extras ? (
            <p className="text-sm text-gray-700">
              <span className="font-medium">#{alerta.animal_numero_arete}</span>{" "}
              {alerta.animal_nombre && <span>{alerta.animal_nombre} — </span>}
              <span>{extras.hoy?.toFixed(1)} L</span>
              <span className="text-gray-500"> (prom. 7 días: {extras.avg_7d?.toFixed(1)} L, </span>
              <span className={isCritico ? "text-red-600 font-semibold" : "text-amber-600 font-semibold"}>
                −{extras.drop_pct?.toFixed(0)}%)
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-700">{alerta.mensaje}</p>
          )}

          {/* Fecha */}
          <p className="mt-1 text-xs text-gray-400">
            {alerta.revisada && alerta.fecha_revision
              ? `Revisada el ${new Date(alerta.fecha_revision).toLocaleString("es-CO")}`
              : `Hace ${tiempoRelativo(alerta.created_at)}`}
          </p>
        </div>

        {/* Botón ACK */}
        {esPropietario && !alerta.revisada && (
          <button
            onClick={(e) => { e.stopPropagation(); onAck(); }}
            className="shrink-0 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition"
          >
            ✓ Revisar
          </button>
        )}
      </div>
    </li>
  );
}

function tiempoRelativo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  return `${Math.floor(hrs / 24)} días`;
}

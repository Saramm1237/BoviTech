import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { animalesApi } from "../../api/animales";
import { eficienciaApi } from "../../api/alimentacion";
import { trazabilidadApi } from "../../api/trazabilidad";
import { useProduccionAnimal } from "../../hooks/useProduccion";
import { TrendChart } from "../../components/features/production/TrendChart";
import { formatDate } from "../../utils/formatters";
import type { Animal } from "../../types/animal";
import type { EficienciaData } from "../../types/alimentacion";
import type { EventoTrazabilidad } from "../../types/trazabilidad";

const TIPO_LABELS: Record<string, string> = {
  ordeno: "Ordeño",
  baja: "Baja del hato",
  alimentacion: "Alimentación",
  alta: "Alta en hato",
};

function formatEvento(e: EventoTrazabilidad): string {
  const d = e.datos_evento as Record<string, unknown>;
  if (e.tipo_evento === "ordeno") return `Ordeño — ${d.volumen_litros} L (${d.turno ?? ""})`;
  if (e.tipo_evento === "baja") return `Baja del hato — ${d.motivo ?? "sin motivo"}`;
  if (e.tipo_evento === "alimentacion") return `Alimentación — ${d.tipo_alimento ?? ""}, ${d.cantidad_kg ?? ""} kg`;
  return TIPO_LABELS[e.tipo_evento] ?? e.tipo_evento;
}

export function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loadingAnimal, setLoadingAnimal] = useState(true);
  const [eficiencia, setEficiencia] = useState<EficienciaData | null>(null);
  const [eventos, setEventos] = useState<EventoTrazabilidad[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);

  const { data: produccion, loading: loadingChart } = useProduccionAnimal(id);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!id) return;
    eficienciaApi.get(id, today)
      .then(({ data }) => setEficiencia(data))
      .catch(() => setEficiencia(null));
    trazabilidadApi.getByAnimal(id)
      .then(({ data }) => setEventos(data))
      .catch(() => setEventos([]))
      .finally(() => setLoadingEventos(false));
  }, [id, today]);

  useEffect(() => {
    if (!id) return;
    animalesApi.get(id)
      .then(({ data }) => setAnimal(data))
      .catch(() => navigate("/animales", { replace: true }))
      .finally(() => setLoadingAnimal(false));
  }, [id, navigate]);

  if (loadingAnimal) {
    return (
      <div className="flex min-h-screen items-center justify-center text-4xl animate-pulse">🐄</div>
    );
  }

  if (!animal) return null;

  const totalChart = produccion.reduce((s, d) => s + d.total_litros, 0);
  const promedioChart = produccion.length ? (totalChart / produccion.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <button
            onClick={() => navigate("/animales")}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Hato
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{animal.nombre ?? animal.numero_arete}</h1>
            <p className="text-xs text-gray-500">Arete: {animal.numero_arete}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Ficha del animal */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Información del animal
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Raza</p>
              <p className="font-medium text-gray-700">{animal.raza ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estado</p>
              <p className={`font-medium ${animal.activo ? "text-green-600" : "text-gray-400"}`}>
                {animal.activo ? "Activo" : "Baja"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha de nacimiento</p>
              <p className="font-medium text-gray-700">{formatDate(animal.fecha_nacimiento)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Último parto</p>
              <p className="font-medium text-gray-700">{formatDate(animal.fecha_ultimo_parto)}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas de producción */}
        {produccion.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-700">{promedioChart}</p>
              <p className="text-xs text-gray-400 mt-1">Prom. diario (L)</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-700">{Math.max(...produccion.map(d => d.total_litros)).toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-1">Máximo (L)</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-700">{produccion.length}</p>
              <p className="text-xs text-gray-400 mt-1">Días con registro</p>
            </div>
          </div>
        )}

        {/* Eficiencia alimenticia hoy */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Eficiencia alimenticia — hoy
          </h2>
          {eficiencia ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-green-700">
                  {eficiencia.litros_producidos !== null ? `${eficiencia.litros_producidos.toFixed(1)} L` : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Producción</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-700">
                  {eficiencia.kg_alimento !== null ? `${eficiencia.kg_alimento.toFixed(1)} kg` : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Alimento</p>
              </div>
              <div>
                <p className="text-xl font-bold text-purple-700">
                  {eficiencia.eficiencia_litros_por_kg !== null
                    ? `${eficiencia.eficiencia_litros_por_kg.toFixed(2)}`
                    : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">L / kg</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400">Sin datos de eficiencia para hoy</p>
          )}
        </div>

        {/* Gráfica de tendencia */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Tendencia de producción — últimos 30 días
          </h2>
          {loadingChart ? (
            <div className="flex items-center justify-center py-10 text-gray-300 animate-pulse text-3xl">📈</div>
          ) : (
            <TrendChart data={produccion} days={30} />
          )}
        </div>
        {/* Historial de trazabilidad */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Historial de trazabilidad
            </h2>
            {animal && (
              <button
                onClick={() => {
                  const url = trazabilidadApi.exportUrl(animal.id);
                  const token = localStorage.getItem("access_token") ?? "";
                  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                    .then((r) => r.blob())
                    .then((blob) => {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = `trazabilidad_${animal.numero_arete}.csv`;
                      a.click();
                    });
                }}
                className="rounded-lg border border-green-200 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
              >
                ↓ Exportar ICA 017
              </button>
            )}
          </div>

          {loadingEventos ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
            </div>
          ) : eventos.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">Sin eventos registrados</p>
          ) : (
            <ol className="relative border-l border-gray-200 ml-3 space-y-4">
              {[...eventos].reverse().map((e) => (
                <li key={e.id} className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-green-500" />
                  <p className="text-sm font-medium text-gray-800">{formatEvento(e)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.created_at).toLocaleString("es-CO")} · {e.responsable_nombre}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </div>
  );
}

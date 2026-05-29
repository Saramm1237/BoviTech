import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { animalesApi } from "../../api/animales";
import { useProduccionAnimal } from "../../hooks/useProduccion";
import { TrendChart } from "../../components/features/production/TrendChart";
import { formatDate } from "../../utils/formatters";
import type { Animal } from "../../types/animal";

export function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loadingAnimal, setLoadingAnimal] = useState(true);

  const { data: produccion, loading: loadingChart } = useProduccionAnimal(id);

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
      </main>
    </div>
  );
}

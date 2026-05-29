import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { alimentacionApi } from "../../api/alimentacion";
import { useAnimales } from "../../hooks/useAnimales";
import type { TipoAlimento } from "../../types/alimentacion";
import type { AxiosError } from "axios";

type Modo = "individual" | "grupo";

const TIPOS: { value: TipoAlimento; label: string }[] = [
  { value: "concentrado", label: "Concentrado" },
  { value: "forraje", label: "Forraje" },
  { value: "suplemento", label: "Suplemento" },
];

const today = new Date().toISOString().split("T")[0];

export function RegistroAlimentacionPage() {
  const navigate = useNavigate();
  const { animales, loading: loadingAnimales } = useAnimales(true);

  const [modo, setModo] = useState<Modo>("individual");
  const [fecha, setFecha] = useState(today);
  const [tipo, setTipo] = useState<TipoAlimento>("concentrado");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Individual
  const [animalId, setAnimalId] = useState("");
  const [cantidadKg, setCantidadKg] = useState("");

  // Grupo
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [totalKg, setTotalKg] = useState("");
  const [kgPorAnimal, setKgPorAnimal] = useState<Map<string, string>>(new Map());

  // Distribuir automáticamente cuando cambia total o selección
  useEffect(() => {
    const total = parseFloat(totalKg);
    if (!isNaN(total) && total > 0 && selectedIds.size > 0) {
      const kgCada = (total / selectedIds.size).toFixed(2);
      setKgPorAnimal(new Map([...selectedIds].map((id) => [id, kgCada])));
    }
  }, [totalKg, selectedIds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleAnimal = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === animales.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(animales.map((a) => a.id)));
    }
  };

  const handleSaveIndividual = async () => {
    if (!animalId) { setError("Selecciona un animal"); return; }
    const kg = parseFloat(cantidadKg);
    if (isNaN(kg) || kg <= 0) { setError("Ingresa una cantidad válida"); return; }

    setSaving(true);
    setError(null);
    try {
      await alimentacionApi.create({ fecha, animal_id: animalId, tipo_alimento: tipo, cantidad_kg: kg });
      showToast("Alimento registrado exitosamente");
      setCantidadKg("");
      setAnimalId("");
    } catch (e) {
      const ae = e as AxiosError<{ detail: string }>;
      setError(ae.response?.data?.detail ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGrupo = async () => {
    if (selectedIds.size === 0) { setError("Selecciona al menos un animal"); return; }
    const total = parseFloat(totalKg);
    if (isNaN(total) || total <= 0) { setError("Ingresa el total de kg"); return; }

    const cantidades = [...selectedIds].map((id) => ({
      animal_id: id,
      cantidad_kg: parseFloat(kgPorAnimal.get(id) ?? "0") || total / selectedIds.size,
    }));

    setSaving(true);
    setError(null);
    try {
      await alimentacionApi.createGrupo({
        fecha,
        animal_ids: [...selectedIds],
        tipo_alimento: tipo,
        cantidad_kg_total: total,
        cantidades_individuales: cantidades,
      });
      showToast(`Alimentación guardada para ${selectedIds.size} animales`);
      setSelectedIds(new Set());
      setTotalKg("");
      setKgPorAnimal(new Map());
    } catch (e) {
      const ae = e as AxiosError<{ detail: string }>;
      setError(ae.response?.data?.detail ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-lg font-bold text-gray-800">Registrar Alimento</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
        {/* Toggle modo */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          {(["individual", "grupo"] as Modo[]).map((m) => (
            <button
              key={m}
              onClick={() => { setModo(m); setError(null); }}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                modo === m ? "bg-green-700 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {m === "individual" ? "🐄 Por animal" : "🐄🐄 Por grupo"}
            </button>
          ))}
        </div>

        {/* Campos comunes */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de alimento</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoAlimento)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Modo individual ─────────────────────────────────────────── */}
          {modo === "individual" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Animal <span className="text-red-500">*</span>
                </label>
                <select
                  value={animalId}
                  onChange={(e) => setAnimalId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="">Seleccionar animal…</option>
                  {animales.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre ? `${a.nombre} (${a.numero_arete})` : a.numero_arete}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cantidad (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0.1"
                  value={cantidadKg}
                  onChange={(e) => setCantidadKg(e.target.value)}
                  placeholder="Ej: 5.5"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleSaveIndividual}
                disabled={saving}
                className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar registro"}
              </button>
            </div>
          )}

          {/* ── Modo grupo ──────────────────────────────────────────────── */}
          {modo === "grupo" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Total kg para el grupo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0.1"
                  value={totalKg}
                  onChange={(e) => setTotalKg(e.target.value)}
                  placeholder="Ej: 100"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
                {selectedIds.size > 0 && parseFloat(totalKg) > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    ≈ {(parseFloat(totalKg) / selectedIds.size).toFixed(2)} kg por animal ({selectedIds.size} seleccionadas)
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleSaveGrupo}
                disabled={saving || selectedIds.size === 0}
                className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {saving ? "Guardando…" : `Guardar ${selectedIds.size > 0 ? `(${selectedIds.size} animales)` : ""}`}
              </button>
            </div>
          )}
        </div>

        {/* ── Lista de animales (modo grupo) ───────────────────────────── */}
        {modo === "grupo" && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Animales</span>
              <button
                onClick={toggleAll}
                className="text-xs text-green-700 hover:underline font-medium"
              >
                {selectedIds.size === animales.length ? "Deseleccionar todas" : "Seleccionar todas"}
              </button>
            </div>

            {loadingAnimales ? (
              <div className="py-8 text-center text-gray-400 animate-pulse">Cargando…</div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {animales.map((animal) => {
                  const isSelected = selectedIds.has(animal.id);
                  return (
                    <li
                      key={animal.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-green-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => toggleAnimal(animal.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-4 w-4 accent-green-700"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {animal.nombre ?? animal.numero_arete}
                        </p>
                        {animal.nombre && (
                          <p className="text-xs text-gray-500">{animal.numero_arete}</p>
                        )}
                      </div>
                      {isSelected && (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0.01"
                            value={kgPorAnimal.get(animal.id) ?? ""}
                            onChange={(e) =>
                              setKgPorAnimal((prev) =>
                                new Map(prev).set(animal.id, e.target.value)
                              )
                            }
                            className="w-16 rounded-lg border border-green-300 px-2 py-1 text-right text-sm outline-none focus:ring-2 focus:ring-green-200"
                          />
                          <span className="text-xs text-gray-500">kg</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-gray-800 px-4 py-3 text-sm text-white shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sesionesApi } from "../../api/produccion";
import { alertasApi } from "../../api/alertas";
import { useAnimales } from "../../hooks/useAnimales";
import type { Alerta, RegistroProduccion, Sesion, Turno } from "../../types/produccion";
import type { AxiosError } from "axios";

type Step = "select-turno" | "registering" | "summary";

export function RegistroOrdenoPage() {
  const navigate = useNavigate();
  const { animales, loading: loadingAnimales } = useAnimales(true);

  const [step, setStep] = useState<Step>("select-turno");
  const [turno, setTurno] = useState<Turno | null>(null);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [registrados, setRegistrados] = useState<Map<string, number>>(new Map()); // animal_id → litros
  const [loadingSesion, setLoadingSesion] = useState(false);

  // Registro por animal
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Summary
  const [alertasSesion, setAlertasSesion] = useState<Alerta[]>([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (activeId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeId]);

  // ── Selección de turno ────────────────────────────────────────────────────

  const handleSelectTurno = async (t: Turno) => {
    setTurno(t);
    setLoadingSesion(true);
    try {
      // Buscar sesión existente para hoy
      const { data: existing } = await sesionesApi.list({ fecha: today, turno: t });
      if (existing.length > 0) {
        const s = existing[0];
        setSesion(s);
        // Cargar animales ya registrados
        const { data: regs } = await sesionesApi.getRegistros(s.id);
        const map = new Map(regs.map((r) => [r.animal_id, r.volumen_litros]));
        setRegistrados(map);
      } else {
        // Crear nueva sesión
        const { data: nueva } = await sesionesApi.create(today, t);
        setSesion(nueva);
        setRegistrados(new Map());
      }
      setStep("registering");
    } catch {
      alert("Error al iniciar la sesión. Intente nuevamente.");
    } finally {
      setLoadingSesion(false);
    }
  };

  // ── Guardar registro de un animal ─────────────────────────────────────────

  const handleSave = async (animalId: string) => {
    const litros = parseFloat(inputValue);
    if (!inputValue || isNaN(litros) || litros <= 0) {
      setInputError("El volumen debe ser mayor a 0");
      return;
    }
    if (!sesion) return;

    setSaving(true);
    setInputError(null);
    try {
      await sesionesApi.addRegistros(sesion.id, [{ animal_id: animalId, volumen_litros: litros }]);
      setRegistrados((prev) => new Map(prev).set(animalId, litros));

      // Auto-enfocar siguiente animal no registrado
      const idx = animales.findIndex((a) => a.id === animalId);
      const next = animales.slice(idx + 1).find((a) => !registrados.has(a.id) && a.id !== animalId);
      setActiveId(next?.id ?? null);
      setInputValue("");
    } catch (err) {
      const ae = err as AxiosError<{ detail: string }>;
      setInputError(ae.response?.data?.detail ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ── Finalizar sesión → resumen ─────────────────────────────────────────────

  const handleFinalizar = async () => {
    try {
      const { data } = await alertasApi.list();
      // Mostrar alertas del día de hoy
      const hoy = new Date().toISOString().split("T")[0];
      setAlertasSesion(data.filter((a) => a.created_at.startsWith(hoy)));
    } catch {
      setAlertasSesion([]);
    }
    setStep("summary");
  };

  const totalLitros = Array.from(registrados.values()).reduce((a, b) => a + b, 0);
  const turnoLabel = turno === "manana" ? "Mañana ☀️" : "Tarde 🌙";

  // ── Pantalla de selección de turno ────────────────────────────────────────

  if (step === "select-turno") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-green-50 px-6">
        <div className="text-center">
          <div className="text-5xl mb-2">🐄</div>
          <h1 className="text-xl font-bold text-green-800">Registrar Ordeño</h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => handleSelectTurno("manana")}
            disabled={loadingSesion}
            className="flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-green-200 py-8 shadow-sm hover:border-green-400 hover:bg-green-50 transition disabled:opacity-50"
          >
            <span className="text-5xl mb-2">☀️</span>
            <span className="text-lg font-semibold text-green-800">Ordeño — Mañana</span>
          </button>
          <button
            onClick={() => handleSelectTurno("tarde")}
            disabled={loadingSesion}
            className="flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-indigo-200 py-8 shadow-sm hover:border-indigo-400 hover:bg-indigo-50 transition disabled:opacity-50"
          >
            <span className="text-5xl mb-2">🌙</span>
            <span className="text-lg font-semibold text-indigo-800">Ordeño — Tarde</span>
          </button>
        </div>
        {loadingSesion && (
          <p className="text-sm text-gray-400 animate-pulse">Cargando sesión…</p>
        )}
      </div>
    );
  }

  // ── Pantalla de resumen ───────────────────────────────────────────────────

  if (step === "summary") {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sesión finalizada</h2>
          <p className="text-sm text-gray-500 mb-6">Ordeño {turnoLabel} · {today}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <p className="text-3xl font-bold text-green-700">{totalLitros.toFixed(1)} L</p>
              <p className="text-xs text-gray-500 mt-1">Total del hato</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <p className="text-3xl font-bold text-gray-700">{registrados.size}</p>
              <p className="text-xs text-gray-500 mt-1">de {animales.length} vacas</p>
            </div>
          </div>

          {alertasSesion.length > 0 && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-sm font-semibold text-red-700 mb-2">
                ⚠️ {alertasSesion.length} alerta{alertasSesion.length > 1 ? "s" : ""} generada{alertasSesion.length > 1 ? "s" : ""}
              </p>
              {alertasSesion.map((a) => (
                <div key={a.id} className="text-xs text-red-600 mt-1">
                  • {a.animal_nombre ?? a.animal_numero_arete ?? "—"} ({a.animal_numero_arete}) — {a.mensaje}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            Ir al panel principal
          </button>
        </div>
      </div>
    );
  }

  // ── Pantalla de registro por animal ──────────────────────────────────────

  const pendientes = animales.filter((a) => !registrados.has(a.id));
  const completados = animales.filter((a) => registrados.has(a.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabecera */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-800">Ordeño {turnoLabel}</h1>
            <p className="text-xs text-gray-500">{registrados.size}/{animales.length} registradas</p>
          </div>
          <button
            onClick={handleFinalizar}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            Finalizar sesión
          </button>
        </div>
        {/* Barra de progreso */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all"
            style={{ width: `${animales.length ? (registrados.size / animales.length) * 100 : 0}%` }}
          />
        </div>
      </header>

      {loadingAnimales ? (
        <div className="flex justify-center py-20 text-gray-400 animate-pulse text-4xl">🐄</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {/* Pendientes */}
          {pendientes.map((animal) => {
            const isActive = activeId === animal.id;
            return (
              <li
                key={animal.id}
                onClick={() => { if (!isActive) { setActiveId(animal.id); setInputValue(""); setInputError(null); } }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isActive ? "bg-green-50" : "hover:bg-gray-50"}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{animal.nombre ?? animal.numero_arete}</p>
                  <p className="text-xs text-gray-500">{animal.numero_arete}</p>
                </div>
                {isActive ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <input
                          ref={inputRef}
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0.1"
                          placeholder="0.0"
                          value={inputValue}
                          onChange={(e) => { setInputValue(e.target.value); setInputError(null); }}
                          onKeyDown={(e) => e.key === "Enter" && handleSave(animal.id)}
                          className="w-20 rounded-lg border border-green-400 px-2 py-2 text-right text-base font-bold outline-none focus:ring-2 focus:ring-green-200"
                        />
                        <span className="text-sm text-gray-500">L</span>
                        <button
                          onClick={() => handleSave(animal.id)}
                          disabled={saving}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
                        >
                          ✓
                        </button>
                      </div>
                      {inputError && (
                        <p className="mt-0.5 text-xs text-red-600">{inputError}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-300">Toca para registrar</span>
                )}
              </li>
            );
          })}

          {/* Registrados */}
          {completados.map((animal) => (
            <li key={animal.id} className="flex items-center gap-3 bg-white px-4 py-3 opacity-60">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">{animal.nombre ?? animal.numero_arete}</p>
                <p className="text-xs text-gray-400">{animal.numero_arete}</p>
              </div>
              <span className="text-sm font-semibold text-green-600">
                ✓ {registrados.get(animal.id)?.toFixed(1)} L
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

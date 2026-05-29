import { useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import type { Animal, AnimalCreate, AnimalUpdate } from "../../../types/animal";

interface AnimalFormProps {
  animal?: Animal;
  onSubmit: (data: AnimalCreate | AnimalUpdate) => Promise<unknown>;
  onCancel: () => void;
}

export function AnimalForm({ animal, onSubmit, onCancel }: AnimalFormProps) {
  const isEdit = Boolean(animal);

  const [numeroArete, setNumeroArete] = useState(animal?.numero_arete ?? "");
  const [nombre, setNombre] = useState(animal?.nombre ?? "");
  const [raza, setRaza] = useState(animal?.raza ?? "");
  const [fechaNacimiento, setFechaNacimiento] = useState(animal?.fecha_nacimiento ?? "");
  const [fechaUltimoParto, setFechaUltimoParto] = useState(animal?.fecha_ultimo_parto ?? "");

  const [areteError, setAreteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAreteError(null);
    setLoading(true);

    const payload = isEdit
      ? ({
          nombre: nombre || null,
          raza: raza || null,
          fecha_nacimiento: fechaNacimiento || null,
          fecha_ultimo_parto: fechaUltimoParto || null,
        } as AnimalUpdate)
      : ({
          numero_arete: numeroArete.trim(),
          nombre: nombre || undefined,
          raza: raza || undefined,
          fecha_nacimiento: fechaNacimiento || undefined,
          fecha_ultimo_parto: fechaUltimoParto || undefined,
        } as AnimalCreate);

    try {
      await onSubmit(payload);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      if (axiosErr.response?.status === 409) {
        setAreteError("Ya existe un animal con este número de arete");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {isEdit ? "Editar animal" : "Agregar animal"}
      </h2>

      {/* Número de arete */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Número de arete <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isEdit}
          value={numeroArete}
          onChange={(e) => { setNumeroArete(e.target.value); setAreteError(null); }}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
            areteError
              ? "border-red-400 focus:ring-red-200"
              : "border-gray-300 focus:border-green-500 focus:ring-green-200"
          } disabled:bg-gray-50 disabled:text-gray-500`}
          placeholder="Ej: 040-2024-001"
        />
        {areteError && (
          <p className="mt-1 text-xs text-red-600">{areteError}</p>
        )}
      </div>

      {/* Nombre */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="Ej: Valentina"
        />
      </div>

      {/* Raza */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Raza</label>
        <input
          type="text"
          value={raza}
          onChange={(e) => setRaza(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="Ej: Holstein"
        />
      </div>

      {/* Fecha de nacimiento */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
        <input
          type="date"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
        />
      </div>

      {/* Fecha último parto */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Fecha del último parto</label>
        <input
          type="date"
          value={fechaUltimoParto}
          onChange={(e) => setFechaUltimoParto(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || (!isEdit && !numeroArete.trim())}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Agregar"}
        </button>
      </div>
    </form>
  );
}

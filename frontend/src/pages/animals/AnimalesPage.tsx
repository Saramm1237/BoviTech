import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnimales } from "../../hooks/useAnimales";
import { useAuth } from "../../context/AuthContext";
import { AnimalForm } from "../../components/features/animals/AnimalForm";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { formatDate } from "../../utils/formatters";
import type { Animal, AnimalCreate, AnimalUpdate } from "../../types/animal";

export function AnimalesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { animales, loading, error, createAnimal, updateAnimal, deactivateAnimal } = useAnimales();
  const esPropietario = user?.rol === "propietario";

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Animal | undefined>(undefined);
  const [bajaTarget, setBajaTarget] = useState<Animal | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (animal: Animal) => {
    setEditTarget(animal);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: AnimalCreate | AnimalUpdate) => {
    if (editTarget) {
      await updateAnimal(editTarget.id, data as AnimalUpdate);
      showToast("Animal actualizado exitosamente");
    } else {
      await createAnimal(data as AnimalCreate);
      showToast("Animal registrado exitosamente");
    }
    setFormOpen(false);
    setEditTarget(undefined);
  };

  const handleConfirmBaja = async () => {
    if (!bajaTarget) return;
    await deactivateAnimal(bajaTarget.id);
    showToast(`${bajaTarget.nombre ?? bajaTarget.numero_arete} dado de baja`);
    setBajaTarget(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐄</span>
            <span className="text-lg font-bold text-green-800">BoviTech</span>
          </div>
          <span className="text-sm text-gray-600">
            {user?.nombre} · <span className="capitalize text-green-700">{user?.rol}</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Título + botón agregar */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Hato activo</h1>
            <p className="text-sm text-gray-500">{animales.length} animales</p>
          </div>
          {esPropietario && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              <span>＋</span> Agregar animal
            </button>
          )}
        </div>

        {/* Estado de carga / error */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <span className="animate-pulse text-4xl">🐄</span>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Tabla de animales */}
        {!loading && !error && animales.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
            <div className="mb-2 text-4xl">🐮</div>
            <p className="text-sm">No hay animales registrados.</p>
            {esPropietario && (
              <button onClick={handleOpenCreate} className="mt-3 text-sm text-green-700 underline">
                Agregar el primero
              </button>
            )}
          </div>
        )}

        {!loading && animales.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Arete</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Raza</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Último parto</th>
                  {esPropietario && <th className="px-4 py-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {animales.map((animal) => (
                  <tr
                    key={animal.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td
                      className="px-4 py-3 font-mono text-green-700 underline cursor-pointer hover:text-green-900"
                      onClick={() => navigate(`/animales/${animal.id}`)}
                    >
                      {animal.numero_arete}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{animal.nombre ?? <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{animal.raza ?? <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {animal.fecha_ultimo_parto ? formatDate(animal.fecha_ultimo_parto) : <span className="text-gray-400">—</span>}
                    </td>
                    {esPropietario && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(animal)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setBajaTarget(animal)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Dar de baja
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal formulario */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <AnimalForm
              animal={editTarget}
              onSubmit={handleFormSubmit}
              onCancel={() => { setFormOpen(false); setEditTarget(undefined); }}
            />
          </div>
        </div>
      )}

      {/* Diálogo de baja */}
      {bajaTarget && (
        <ConfirmDialog
          title="¿Dar de baja?"
          message={`¿Seguro que quieres dar de baja a ${bajaTarget.nombre ?? bajaTarget.numero_arete}? Sus datos históricos se conservarán en modo solo lectura.`}
          confirmLabel="Sí, dar de baja"
          cancelLabel="Cancelar"
          danger
          onConfirm={handleConfirmBaja}
          onCancel={() => setBajaTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-gray-800 px-4 py-3 text-sm text-white shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

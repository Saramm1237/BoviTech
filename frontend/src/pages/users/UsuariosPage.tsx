import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUsuarios } from "../../hooks/useUsuarios";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import type { AxiosError } from "axios";
import type { UsuarioRead } from "../../types/usuario";

export function UsuariosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { usuarios, loading, error, createUsuario, deactivateUsuario, toggleVerAlertas } = useUsuarios();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UsuarioRead | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deactivateUsuario(deleteTarget.id);
    showToast(`${deleteTarget.nombre} eliminado de la finca`);
    setDeleteTarget(null);
  };

  const handleToggleAlertas = async (id: string) => {
    await toggleVerAlertas(id);
    showToast("Permiso de alertas actualizado");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              ← Panel
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Gestión de usuarios</h1>
              <p className="text-xs text-gray-500">{usuarios.length} usuarios en la finca</p>
            </div>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
          >
            ＋ Agregar operario
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-200" />)}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">Ver alertas</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u) => {
                  const esSelf = u.id === user?.id;
                  const esPropietario = u.rol === "propietario";
                  return (
                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.activo ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{u.nombre}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{u.email}</p>
                        <p className="text-xs text-gray-400">
                          Alta: {new Date(u.created_at).toLocaleDateString("es-CO")}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            esPropietario
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {esPropietario ? "Propietario" : "Operario"}
                        </span>
                        {esSelf && (
                          <span className="ml-1 text-xs text-gray-400">(tú)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {!esPropietario ? (
                          <button
                            onClick={() => handleToggleAlertas(u.id)}
                            title={u.ver_alertas ? "Deshabilitar ver alertas" : "Habilitar ver alertas"}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              u.ver_alertas
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {u.ver_alertas ? "✓ Sí" : "No"}
                          </button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!esSelf && !esPropietario && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal: agregar operario */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <OperarioForm
              onSubmit={async (data) => {
                await createUsuario({ ...data, rol: "operario" });
                showToast(`Operario ${data.nombre} agregado exitosamente`);
                setFormOpen(false);
              }}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Diálogo confirmar eliminación */}
      {deleteTarget && (
        <ConfirmDialog
          title="¿Eliminar operario?"
          message={`¿Seguro que quieres eliminar a ${deleteTarget.nombre}? Ya no podrá iniciar sesión en la plataforma.`}
          confirmLabel="Sí, eliminar"
          cancelLabel="Cancelar"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
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

// ── Formulario de creación de operario ────────────────────────────────────────

interface OperarioFormProps {
  onSubmit: (data: { nombre: string; email: string; password: string }) => Promise<void>;
  onCancel: () => void;
}

function OperarioForm({ onSubmit, onCancel }: OperarioFormProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setLoading(true);
    try {
      await onSubmit({ nombre, email, password });
    } catch (err) {
      const ae = err as AxiosError<{ detail: string }>;
      if (ae.response?.status === 409) {
        setEmailError("Este email ya está registrado en la plataforma");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Agregar operario</h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Mario González"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
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
          onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
          placeholder="operario@finca.com"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
            emailError
              ? "border-red-400 focus:ring-red-200"
              : "border-gray-300 focus:border-green-500 focus:ring-green-200"
          }`}
        />
        {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Contraseña temporal <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
        />
        <p className="mt-1 text-xs text-gray-400">
          El operario puede cambiarla después desde su perfil.
        </p>
      </div>

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
          disabled={loading || !nombre || !email || !password}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Creando…" : "Agregar operario"}
        </button>
      </div>
    </form>
  );
}

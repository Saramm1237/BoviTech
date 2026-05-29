import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportesApi, type ReporteJob } from "../../api/reportes";

type Tipo = "semanal" | "mensual";
type Formato = "pdf" | "excel";
type Estado = "idle" | "generating" | "ready" | "failed";

function getDefaultRange(tipo: Tipo): { inicio: string; fin: string } {
  const today = new Date();
  if (tipo === "semanal") {
    const day = today.getDay() || 7;
    const lunes = new Date(today);
    lunes.setDate(today.getDate() - day + 1);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() - 7);
    const inicioSem = new Date(domingo);
    return {
      inicio: inicioSem.toISOString().split("T")[0],
      fin: new Date(inicioSem.getTime() + 6 * 86400000).toISOString().split("T")[0],
    };
  } else {
    const mes = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const finMes = new Date(today.getFullYear(), today.getMonth(), 0);
    return {
      inicio: mes.toISOString().split("T")[0],
      fin: finMes.toISOString().split("T")[0],
    };
  }
}

export function ReportesPage() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<Tipo>("semanal");
  const [formato, setFormato] = useState<Formato>("excel");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Actualizar fechas cuando cambia el tipo
  useEffect(() => {
    const { inicio, fin } = getDefaultRange(tipo);
    setFechaInicio(inicio);
    setFechaFin(fin);
  }, [tipo]);

  // Limpiar el poll al desmontar
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleGenerar = async () => {
    setEstado("generating");
    setDownloadUrl(null);
    try {
      const fn = formato === "pdf" ? reportesApi.requestPdf : reportesApi.requestExcel;
      const { data } = await fn({ tipo, fecha_inicio: fechaInicio, fecha_fin: fechaFin });
      setJobId(data.job_id);
      // Pollear cada 2 segundos
      pollRef.current = setInterval(async () => {
        const { data: status } = await reportesApi.getStatus(data.job_id);
        if (status.status === "ready") {
          clearInterval(pollRef.current!);
          setDownloadUrl(reportesApi.downloadUrl(data.job_id));
          setEstado("ready");
        } else if (status.status === "failed") {
          clearInterval(pollRef.current!);
          setEstado("failed");
        }
      }, 2000);
    } catch {
      setEstado("failed");
    }
  };

  const handleDescargar = () => {
    if (!downloadUrl || !jobId) return;
    const token = localStorage.getItem("access_token") ?? "";
    fetch(downloadUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = formato === "pdf" ? `reporte_${fechaInicio}.pdf` : `reporte_${fechaInicio}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
  };

  const handleReiniciar = () => {
    setEstado("idle");
    setJobId(null);
    setDownloadUrl(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Panel
          </button>
          <h1 className="text-lg font-bold text-gray-800">Reportes</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          {/* Tipo */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Tipo de reporte</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {(["semanal", "mensual"] as Tipo[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  disabled={estado === "generating"}
                  className={`flex-1 py-3 text-sm font-semibold capitalize transition ${
                    tipo === t ? "bg-green-700 text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t === "semanal" ? "📅 Semanal" : "📆 Mensual"}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={estado === "generating"}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={estado === "generating"}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Formato */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Formato</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {(["excel", "pdf"] as Formato[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormato(f)}
                  disabled={estado === "generating"}
                  className={`flex-1 py-3 text-sm font-semibold transition ${
                    formato === f ? "bg-green-700 text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {f === "excel" ? "📊 Excel (.xlsx)" : "📄 PDF"}
                </button>
              ))}
            </div>
          </div>

          {/* Botón / Estado */}
          <div className="pt-2">
            {estado === "idle" && (
              <button
                onClick={handleGenerar}
                disabled={!fechaInicio || !fechaFin}
                className="w-full rounded-xl bg-green-700 py-3.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                Generar reporte
              </button>
            )}

            {estado === "generating" && (
              <div className="text-center py-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent mb-3" />
                <p className="text-sm text-gray-600">Generando reporte…</p>
                <p className="text-xs text-gray-400 mt-1">Esto puede tardar unos segundos</p>
              </div>
            )}

            {estado === "ready" && (
              <div className="space-y-3 text-center">
                <div className="text-4xl">✅</div>
                <p className="text-sm font-semibold text-green-700">¡Reporte listo!</p>
                <button
                  onClick={handleDescargar}
                  className="w-full rounded-xl bg-green-700 py-3.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Descargar {formato === "excel" ? "Excel" : "PDF"}
                </button>
                <button
                  onClick={handleReiniciar}
                  className="w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Generar otro reporte
                </button>
              </div>
            )}

            {estado === "failed" && (
              <div className="space-y-3 text-center">
                <p className="text-sm text-red-600">
                  Error al generar el reporte. Por favor intenta de nuevo.
                </p>
                <button
                  onClick={handleReiniciar}
                  className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Los reportes incluyen los campos requeridos por la Resolución ICA 017 de 2012
        </p>
      </main>
    </div>
  );
}

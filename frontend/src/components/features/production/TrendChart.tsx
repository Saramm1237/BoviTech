import type { ProduccionDiaria } from "../../../types/produccion";

interface TrendChartProps {
  data: ProduccionDiaria[];
  days?: number;
}

export function TrendChart({ data, days = 30 }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-sm text-gray-400">
        Sin registros en los últimos {days} días
      </div>
    );
  }

  // Construir rango de fechas
  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1) + i);
    return d.toISOString().split("T")[0];
  });

  const dataMap = new Map(data.map((d) => [d.fecha, d.total_litros]));
  const maxY = Math.max(...data.map((d) => d.total_litros), 1);

  const W = 560, H = 180;
  const padL = 38, padR = 12, padT = 14, padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xAt = (i: number) => padL + (i / (days - 1)) * plotW;
  const yAt = (v: number) => padT + plotH - (v / maxY) * plotH;

  // Construir segmentos de línea (separados por días sin datos)
  const segments: string[] = [];
  let seg = "";
  for (let i = 0; i < days; i++) {
    const val = dataMap.get(dates[i]);
    if (val !== undefined) {
      seg += `${seg ? " L" : "M"}${xAt(i).toFixed(1)},${yAt(val).toFixed(1)}`;
    } else {
      if (seg) { segments.push(seg); seg = ""; }
    }
  }
  if (seg) segments.push(seg);

  // Puntos de datos
  const dots = dates.flatMap((fecha, i) => {
    const val = dataMap.get(fecha);
    return val !== undefined ? [{ x: xAt(i), y: yAt(val), val, fecha }] : [];
  });

  // Etiquetas del eje Y
  const yLabels = [0, 0.5, 1].map((f) => ({
    y: padT + plotH - f * plotH,
    label: (f * maxY).toFixed(1),
  }));

  // Etiquetas del eje X (primera, media, última)
  const xLabelIdxs = [0, Math.floor(days / 2), days - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gráfica de tendencia de producción"
    >
      {/* Líneas de referencia Y */}
      {yLabels.map(({ y, label }) => (
        <g key={label}>
          <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth={1} />
          <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
            {label}
          </text>
        </g>
      ))}

      {/* Área bajo la curva (fill sutil) */}
      {segments.map((d, i) => {
        const firstPt = d.match(/M([\d.]+),([\d.]+)/);
        const allMatches = [...d.matchAll(/L([\d.]+),([\d.]+)/g)];
        const lastPt = allMatches.length > 0 ? allMatches[allMatches.length - 1] : undefined;
        if (!firstPt) return null;
        const x1 = parseFloat(firstPt[1]);
        const x2 = lastPt ? parseFloat(lastPt[1]) : x1;
        const bottom = padT + plotH;
        const fill = `${d} L${x2},${bottom} L${x1},${bottom} Z`;
        return <path key={`fill-${i}`} d={fill} fill="#15803d" fillOpacity={0.08} />;
      })}

      {/* Líneas de la serie */}
      {segments.map((d, i) => (
        <path
          key={`line-${i}`}
          d={d}
          fill="none"
          stroke="#15803d"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* Puntos */}
      {dots.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#15803d" stroke="white" strokeWidth={1.5} />
      ))}

      {/* Etiquetas eje X */}
      {xLabelIdxs.map((i) => (
        <text key={i} x={xAt(i)} y={H - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">
          {dates[i]?.slice(5).replace("-", "/")}
        </text>
      ))}

      {/* Etiqueta unidad */}
      <text x={padL - 4} y={padT - 4} textAnchor="end" fontSize={8} fill="#9ca3af">
        L
      </text>
    </svg>
  );
}

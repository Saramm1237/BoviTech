const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return DATE_FORMATTER.format(new Date(dateStr));
}

export function formatLitros(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${NUMBER_FORMATTER.format(value)} L`;
}

export function formatKg(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${NUMBER_FORMATTER.format(value)} kg`;
}

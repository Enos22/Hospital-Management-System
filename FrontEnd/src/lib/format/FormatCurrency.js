export function formatCurrency(value, currency = "KES", locale = "en-KE") {
  if (value === null || value === undefined || value === "") return "-";
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "-";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
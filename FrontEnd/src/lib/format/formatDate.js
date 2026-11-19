export function formatDate(value, options = {}) {
  if (value === null || value === undefined || value === "") return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    ...options,
  }).format(date);
}

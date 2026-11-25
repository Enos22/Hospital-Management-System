function parseDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== "string") return new Date(value);

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }

  const sqlDateTime = /^(\d{4})-(\d{2})-(\d{2})[ T]([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/.exec(value);
  if (sqlDateTime) {
    return new Date(
      Number(sqlDateTime[1]),
      Number(sqlDateTime[2]) - 1,
      Number(sqlDateTime[3]),
      Number(sqlDateTime[4]),
      Number(sqlDateTime[5]),
    );
  }

  return new Date(value.replace(/(\.\d{3})\d+/, "$1"));
}

export function formatDate(value, options = {}) {
  if (value === null || value === undefined || value === "") return "-";
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).padStart(4, "0");
  const formattedDate = `${day}/${month}/${year}`;

  if (options.timeStyle === "short") {
    return `${formattedDate} ${formatTime(date)}`;
  }

  return formattedDate;
}

export function formatTime(value) {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "string") {
    const timeOnly = /^([01]\d|2[0-3]):([0-5]\d)/.exec(value);
    if (timeOnly) return `${timeOnly[1]}:${timeOnly[2]}`;

    const sqlDateTime = /^\d{4}-\d{2}-\d{2}[ T]([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/.exec(value);
    if (sqlDateTime) return `${sqlDateTime[1]}:${sqlDateTime[2]}`;
  }

  const date = value instanceof Date ? value : parseDate(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDateTime(value) {
  if (value === null || value === undefined || value === "") return "-";
  return `${formatDate(value)} ${formatTime(value)}`;
}

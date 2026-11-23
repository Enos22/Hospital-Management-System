import { formatDate, formatDateTime, formatTime } from "../../lib/format/FormatDate.js";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "string") return value;
  return null;
}

function formatFieldValue(key, value) {
  const formattedValue = formatValue(value);
  if (typeof value !== "string" || !formattedValue) return formattedValue;

  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)) {
    return formatDateTime(value);
  }
  if (/(^|_)(time|start_time|end_time)$/.test(key)) return formatTime(value);
  if (/(^|_)(date|at)$/.test(key)) return formatDate(value);

  return formattedValue;
}

function labelFor(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DetailList({ data, emptyMessage = "No details available." }) {
  if (data === null || data === undefined) return <p>{emptyMessage}</p>;

  const primitive = formatValue(data);
  if (primitive !== null) return <p>{primitive}</p>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <p>{emptyMessage}</p>;

    const objectRows = data.filter((item) => item && typeof item === "object");
    if (objectRows.length === 0) {
      return (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{formatValue(item) ?? "—"}</li>
          ))}
        </ul>
      );
    }

    const columns = [...new Set(objectRows.flatMap((item) =>
      Object.keys(item).filter((key) => !["password", "password_hash"].includes(key))
    ))].slice(0, 6);

    return (
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{labelFor(column)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {objectRows.map((item, index) => (
              <tr key={item.id ?? item.invoice_id ?? item.appointment_id ?? index}>
                {columns.map((column) => {
                  const value = formatFieldValue(column, item[column]);
                  return (
                    <td key={column}>
                      {value ?? (item[column] && typeof item[column] === "object"
                        ? "View details"
                        : "—")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const entries = Object.entries(data).filter(([key]) =>
    !["password", "password_hash"].includes(key)
  );

  if (entries.length === 0) return <p>{emptyMessage}</p>;

  return (
    <dl className="detail-list">
      {entries.map(([key, value]) => (
        <div className="detail-list__item" key={key}>
          <dt>{labelFor(key)}</dt>
          <dd>
            {formatFieldValue(key, value) ??
              (Array.isArray(value)
                ? <DetailList data={value} />
                : value && typeof value === "object"
                  ? <DetailList data={value} />
                  : "—")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

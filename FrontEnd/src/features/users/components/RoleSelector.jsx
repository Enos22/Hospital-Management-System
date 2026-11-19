const ROLES = ["admin", "doctor", "patient", "billing"];

export default function RoleSelector({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <select
      aria-label="User role"
      value={value ?? ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
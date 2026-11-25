export default function PatientForm({
  patient = null,
  onSubmit,
  onCancel,
  busy = false,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const data = {};
    for (const field of ["username", "email", "password"]) {
      const value = String(form.get(field) ?? "").trim();
      if (value) data[field] = value;
    }

    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{patient ? "Update patient account" : "Add patient account"}</h2>

      <label>
        Username
        <input
          name="username"
          defaultValue={patient?.username ?? ""}
          required={!patient}
        />
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          defaultValue={patient?.email ?? ""}
          required={!patient}
        />
      </label>

      {!patient && (
        <label>
          Password
          <input name="password" type="password" minLength="8" required />
        </label>
      )}

      <button type="submit" disabled={busy}>
        {busy ? "Saving…" : patient ? "Save changes" : "Add patient"}
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      )}
    </form>
  );
}
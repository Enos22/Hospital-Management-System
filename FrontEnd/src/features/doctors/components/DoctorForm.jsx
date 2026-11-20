export default function DoctorForm({
  doctor = null,
  onSubmit,
  onCancel,
  busy = false,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const data = {
      username: String(form.get("username") ?? "").trim(),
    };

    const email = String(form.get("email") ?? "").trim();
    if (email) data.email = email;

    if (!doctor) {
      data.speciality_id = Number(form.get("speciality_id"));
      data.password = String(form.get("password") ?? "");
    }

    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{doctor ? "Update doctor" : "Add doctor"}</h2>

      <label>
        Username
        <input name="username" defaultValue={doctor?.username ?? ""} required />
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          defaultValue={doctor?.email ?? ""}
        />
      </label>

      {!doctor && (
        <>
          <label>
            Specialty ID
            <input name="speciality_id" type="number" min="1" required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength="8" required />
          </label>
        </>
      )}

      <button type="submit" disabled={busy}>
        {busy ? "Saving…" : doctor ? "Save changes" : "Add doctor"}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      )}
    </form>
  );
}
/*
 * TODO: Build doctor directory UI; keep user IDs distinct from doctor profile IDs.
 */
import { useState } from "react";
import DoctorCard from "./DoctorCard";
import DoctorForm from "./DoctorForm";
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctors,
  useUpdateDoctor,
} from "../hooks/useDoctors";

function doctorUserId(doctor) {
  // Backend doctor endpoints use the associated User.id.
  return doctor.id ?? doctor.user_id;
}

export default function DoctorDirectory({ canManage = false, onView }) {
  const { doctors, loading, refreshing, error, refresh } = useDoctors();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const deleteDoctor = useDeleteDoctor();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [feedback, setFeedback] = useState("");

  const mutationError =
    createDoctor.error || updateDoctor.error || deleteDoctor.error;
  const busy =
    createDoctor.isPending || updateDoctor.isPending || deleteDoctor.isPending;

  const filteredDoctors = (Array.isArray(doctors) ? doctors : []).filter(
    (doctor) =>
      `${doctor.username ?? ""} ${doctor.email ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  async function saveDoctor(data) {
    setFeedback("");
    try {
      if (editingDoctor) {
        await updateDoctor.mutateAsync({
          userId: doctorUserId(editingDoctor),
          data,
        });
        setFeedback("Doctor account updated.");
      } else {
        await createDoctor.mutateAsync(data);
        setFeedback("Doctor account created.");
        setShowForm(false);
      }
      setEditingDoctor(null);
    } catch {
      // Mutation error is displayed below.
    }
  }

  async function removeDoctor(doctor) {
    const id = doctorUserId(doctor);
    if (id == null) return;

    if (
      window.prompt(
        `Type DELETE to remove ${doctor.username ?? "this doctor"}:`
      ) !== "DELETE"
    ) {
      return;
    }

    setFeedback("");
    try {
      await deleteDoctor.mutateAsync(id);
      setFeedback("Doctor account deleted.");
    } catch {
      // Mutation error is displayed below.
    }
  }

  return (
    <section>
      <h1>Doctors</h1>

      <label>
        Search doctors
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <button type="button" onClick={() => refresh()} disabled={refreshing}>
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>

      {canManage && (
        <button type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Close form" : "Add doctor"}
        </button>
      )}

      {canManage && showForm && (
        <DoctorForm
          onSubmit={saveDoctor}
          onCancel={() => setShowForm(false)}
          busy={busy}
        />
      )}

      {canManage && editingDoctor && (
        <DoctorForm
          doctor={editingDoctor}
          onSubmit={saveDoctor}
          onCancel={() => setEditingDoctor(null)}
          busy={busy}
        />
      )}

      {loading && <p>Loading doctors…</p>}
      {(error || mutationError) && (
        <p role="alert">{(error || mutationError).message}</p>
      )}
      {feedback && <p role="status">{feedback}</p>}

      <div className="directory-grid">
        {filteredDoctors.map((doctor) => (
          <DoctorCard
            key={doctorUserId(doctor)}
            doctor={doctor}
            onView={onView}
            actions={
              canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(doctor)}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeDoctor(doctor)}
                  >
                    Delete
                  </button>
                </>
              )
            }
          />
        ))}
      </div>

      {!loading && filteredDoctors.length === 0 && <p>No doctors found.</p>}
    </section>
  );
}
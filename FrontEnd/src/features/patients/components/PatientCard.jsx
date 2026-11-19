export default function PatientCard({ patient, onView, actions }) {
  const userId = patient.id ?? patient.user_id;
  const name = patient.username ?? patient.name ?? "Patient";
  const email = patient.email ?? "No email provided";

  return (
    <article className="directory-card">
      <div className="directory-card__identity">
        <span className="directory-card__avatar" aria-hidden="true">
          {String(name).slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h2>{name}</h2>
          <p>{email}</p>
        </div>
      </div>
      {userId != null && <p className="directory-card__detail">Account ID: {userId}</p>}
      <div className="directory-card__actions">
        {onView && userId != null && (
          <button type="button" onClick={() => onView(patient)}>View details</button>
        )}
        {actions}
      </div>
    </article>
  );
}

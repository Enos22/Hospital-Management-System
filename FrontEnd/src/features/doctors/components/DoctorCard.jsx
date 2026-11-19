export default function DoctorCard({ doctor, onView, actions }) {
  const userId = doctor.id ?? doctor.user_id;
  const name = doctor.username ?? doctor.name ?? "Doctor";
  const email = doctor.email ?? "No email provided";

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
      {doctor.speciality && <p className="directory-card__detail">{doctor.speciality}</p>}
      <div className="directory-card__actions">
        {onView && userId != null && (
          <button type="button" onClick={() => onView(doctor)}>View details</button>
        )}
        {actions}
      </div>
    </article>
  );
}

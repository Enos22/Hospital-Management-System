from datetime import datetime

from app.benson.models import Doctor, Specialty


def find_doctors(specialty, date):
    # find doctors of a specialty who have free time on a date (YYYY-MM-DD)
    if not specialty:
        raise ValueError("Specialty is required")

    try:
        if date:
            datetime.strptime(date, "%Y-%m-%d")
        else:
            date = str(datetime.utcnow().date())
    except ValueError:
        raise ValueError("Date must look like 2026-03-31")

    # Antony's scheduling code tells us the free slots
    try:
        from app.antony.services.scheduling_service import get_available_slots
    except ImportError:
        raise ValueError("Scheduling service is not ready yet")

    spec = Specialty.query.filter(Specialty.name.ilike(specialty)).first()
    if spec is None:
        raise LookupError("Specialty not found")

    doctors = Doctor.query.filter_by(specialty_id=spec.id).all()

    matches = []
    for doctor in doctors:
        slots = get_available_slots(doctor.id, date)
        if slots:
            matches.append({
                "doctor_id": doctor.id,
                "specialty": spec.name,
                "free_slots": len(slots),
                "first_slot": str(slots[0]),
            })

    # earliest first slot comes first
    matches.sort(key=lambda m: m["first_slot"])
    return matches
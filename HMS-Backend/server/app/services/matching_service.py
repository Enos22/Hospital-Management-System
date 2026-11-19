from datetime import datetime

from app.models import Doctor, Speciality
from app.services.scheduling_service import SchedulingService


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

    spec = Speciality.query.filter(Speciality.name.ilike(specialty)).first()
    if spec is None:
        raise LookupError("Specialty not found")

    doctors = Doctor.query.filter_by(specialty_id=spec.id).all()

    matches = []
    for doctor in doctors:
        schedule = SchedulingService.get_available_time_slots(doctor.id, date)
        slots = schedule.get("available_slots", [])
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
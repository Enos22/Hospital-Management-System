from datetime import date, datetime, time, timedelta

from app.models.appointment import Appointment


def check_appointment_conflict(
    doctor_id: int,
    patient_id: int,
    appointment_date: str,
    start_time: str,
    duration_minutes: int = 30,
    exclude_appointment_id: int = None,
) -> dict:
    """Check whether a doctor or patient is already booked for an overlapping slot."""
    try:
        if isinstance(appointment_date, str):
            date_value = datetime.strptime(appointment_date, "%Y-%m-%d").date()
        elif isinstance(appointment_date, datetime):
            date_value = appointment_date.date()
        elif isinstance(appointment_date, date):
            date_value = appointment_date
        else:
            raise ValueError
        parsed_start = datetime.strptime(start_time, "%H:%M")
        if duration_minutes <= 0:
            raise ValueError
        start_dt = datetime.combine(date_value, parsed_start.time())
        end_dt = start_dt + timedelta(minutes=duration_minutes)
    except (TypeError, ValueError):
        return {"has_conflict": True, "message": "Invalid appointment time or date format."}

    day_start = datetime.combine(date_value, time.min)
    day_end = day_start + timedelta(days=1)
    base_query = Appointment.query.filter(
        Appointment.appointment_date >= day_start,
        Appointment.appointment_date < day_end,
        Appointment.status.notin_(("cancelled", "Cancelled")),
    )

    if exclude_appointment_id is not None:
        base_query = base_query.filter(Appointment.id != exclude_appointment_id)

    for existing in base_query.all():
        existing_start = datetime.combine(date_value, existing.appointment_time)
        existing_end = existing_start + timedelta(minutes=30)
        overlaps = start_dt < existing_end and existing_start < end_dt
        if overlaps and existing.doctor_id == doctor_id:
            return {
                "has_conflict": True,
                "message": "Scheduling conflict: The selected doctor is already booked for an overlapping time slot.",
            }
        if overlaps and existing.patient_id == patient_id:
            return {
                "has_conflict": True,
                "message": "Scheduling conflict: The patient already has another appointment scheduled during this time slot.",
            }

    return {"has_conflict": False, "message": "No scheduling conflicts detected."}

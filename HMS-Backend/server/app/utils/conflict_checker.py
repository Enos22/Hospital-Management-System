from datetime import datetime, timedelta

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
        else:
            date_value = appointment_date

        start_dt = datetime.strptime(start_time, "%H:%M")
        end_dt = start_dt + timedelta(minutes=duration_minutes)
        end_time = end_dt.strftime("%H:%M")
    except ValueError:
        return {"has_conflict": True, "message": "Invalid appointment time or date format."}

    base_query = Appointment.query.filter(
        Appointment.appointment_date == date_value,
        Appointment.status != "cancelled",
    )

    if exclude_appointment_id is not None:
        base_query = base_query.filter(Appointment.id != exclude_appointment_id)

    doctor_conflict = base_query.filter(
        Appointment.doctor_id == doctor_id,
        Appointment.start_time < end_time,
        Appointment.end_time > start_time,
    ).first()

    if doctor_conflict:
        return {
            "has_conflict": True,
            "message": "Scheduling conflict: The selected doctor is already booked for an overlapping time slot.",
        }

    patient_conflict = base_query.filter(
        Appointment.patient_id == patient_id,
        Appointment.start_time < end_time,
        Appointment.end_time > start_time,
    ).first()

    if patient_conflict:
        return {
            "has_conflict": True,
            "message": "Scheduling conflict: The patient already has another appointment scheduled during this time slot.",
        }

    return {"has_conflict": False, "message": "No scheduling conflicts detected."}

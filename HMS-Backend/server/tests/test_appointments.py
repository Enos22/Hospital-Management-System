from datetime import datetime, time

from app.extensions import db
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient


def test_create_appointment(app):
    with app.app_context():
        appointment = Appointment(
            patient_id=1,
            doctor_id=1,
            appointment_date=datetime(2026, 11, 11, 10, 0),
            appointment_time=time(10, 0),
            status="Scheduled"
        )

        db.session.add(appointment)
        db.session.commit()

        saved_appointment = Appointment.query.first()

        assert saved_appointment is not None
        assert saved_appointment.patient_id == 1
        assert saved_appointment.doctor_id == 1
        assert saved_appointment.status == "Scheduled"


def test_appointment_api_rejects_overlapping_doctor_slot(
    client, make_user, token_for
):
    patient_user, patient = make_user("patient", username="appointment-patient")
    doctor_user, _ = make_user("doctor", username="appointment-doctor")
    doctor = Doctor.query.filter_by(user_id=doctor_user.id).first()
    headers = {"Authorization": f"Bearer {token_for(patient_user)}"}
    payload = {
        "patient_id": patient.id,
        "doctor_id": doctor.id,
        "appointment_date": "2026-11-20",
        "start_time": "10:00",
        "end_time": "10:30",
    }

    first = client.post("/api/appointments", json=payload, headers=headers)
    assert first.status_code == 201

    overlapping = dict(payload, start_time="10:15", end_time="10:45")
    second = client.post("/api/appointments", json=overlapping, headers=headers)
    assert second.status_code == 409

    separate = dict(payload, start_time="11:00", end_time="11:30")
    third = client.post("/api/appointments", json=separate, headers=headers)
    assert third.status_code == 201
from datetime import datetime, time

from app.extensions import db
from app.models.appointment import Appointment


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
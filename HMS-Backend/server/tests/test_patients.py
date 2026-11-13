import pytest

from app.extensions import db
from app.models.user import User
from app.models.patient import Patient


def test_patient_profile_is_owner_scoped(client, make_user, token_for):
    patient_user, _ = make_user("patient", username="profile-owner")
    other_user, _ = make_user("patient", username="profile-other")

    own = client.get(
        f"/api/patients/{patient_user.id}",
        headers={"Authorization": f"Bearer {token_for(patient_user)}"},
    )
    assert own.status_code == 200

    denied = client.get(
        f"/api/patients/{patient_user.id}",
        headers={"Authorization": f"Bearer {token_for(other_user)}"},
    )
    assert denied.status_code == 403


def test_create_patient(app):
    with app.app_context():

        user = User(
            name="Jane Doe",
            email="jane@example.com",
            password="password123"
        )

        db.session.add(user)
        db.session.commit()

        patient = Patient(
            user_id=user.id,
            name="Jane Doe",
            age=28,
            gender="Female",
            address="Nairobi, Kenya",
            phone_number="+254712345678",
            email="jane@example.com"
        )

        db.session.add(patient)
        db.session.commit()

        saved_patient = Patient.query.first()

        assert saved_patient is not None
        assert saved_patient.user_id == user.id
        assert saved_patient.name == "Jane Doe"
        assert saved_patient.age == 28
        assert saved_patient.gender == "Female"
        assert saved_patient.address == "Nairobi, Kenya"
        assert saved_patient.phone_number == "+254712345678"
        assert saved_patient.email == "jane@example.com"


def test_patient_relationship(app):
    with app.app_context():

        user = User(
            name="John Smith",
            email="john@example.com",
            password="password123"
        )

        db.session.add(user)
        db.session.commit()

        patient = Patient(
            user_id=user.id,
            name="John Smith",
            age=35,
            gender="Male"
        )

        db.session.add(patient)
        db.session.commit()

        assert patient.user == user
        assert user.patient == patient


def test_patient_repr(app):
    with app.app_context():

        user = User(
            name="Alice",
            email="alice@example.com",
            password="password123"
        )

        db.session.add(user)
        db.session.commit()

        patient = Patient(
            user_id=user.id,
            name="Alice",
            age=22,
            gender="Female"
        )

        db.session.add(patient)
        db.session.commit()

        assert repr(patient) == f"<Patient {patient.id} - Name Alice>"
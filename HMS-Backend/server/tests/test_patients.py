import pytest

from app.extensions import db
from app.models.user import User
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord


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


def test_admin_create_patient_creates_profile(client, make_user, token_for):
    admin, _ = make_user("admin", username="patient-admin")
    response = client.post(
        "/api/patients",
        headers={"Authorization": f"Bearer {token_for(admin)}"},
        json={
            "username": "created-patient",
            "email": "created-patient@example.com",
            "password": "Test-password-123",
            "name": "Created Patient",
            "age": 24,
            "gender": "Female",
        },
    )

    assert response.status_code == 201
    patient_data = response.get_json()
    assert patient_data["patient_id"] is not None
    assert patient_data["name"] == "Created Patient"
    assert patient_data["age"] == 24
    assert patient_data["gender"] == "Female"


def test_patient_list_includes_clinical_profile_id(client, make_user, token_for):
    doctor, _ = make_user("doctor", username="patient-list-doctor")
    patient, patient_profile = make_user(
        "patient",
        username="patient-list-entry",
    )

    response = client.get(
        "/api/patients?per_page=100",
        headers={"Authorization": f"Bearer {token_for(doctor)}"},
    )

    assert response.status_code == 200
    listed_patient = next(
        item
        for item in response.get_json()["patients"]
        if item["user_id"] == patient.id
    )
    assert listed_patient["patient_id"] == patient_profile.id


def test_doctor_can_update_patient_contact_details_only(
    client, make_user, token_for
):
    doctor, _ = make_user("doctor", username="contact-update-doctor")
    patient, _ = make_user("patient", username="contact-update-patient")
    doctor_headers = {"Authorization": f"Bearer {token_for(doctor)}"}

    updated = client.patch(
        f"/api/patients/{patient.id}",
        headers=doctor_headers,
        json={"phone_number": "+254700123456", "address": "Nairobi"},
    )

    assert updated.status_code == 200
    assert updated.get_json()["phone_number"] == "+254700123456"
    assert updated.get_json()["address"] == "Nairobi"

    denied = client.patch(
        f"/api/patients/{patient.id}",
        headers=doctor_headers,
        json={"username": "changed-by-doctor"},
    )

    assert denied.status_code == 403


def test_admin_can_repair_patient_without_profile(
    client, app, make_user, token_for
):
    admin, _ = make_user("admin", username="profile-repair-admin")
    with app.app_context():
        user = User(
            username="legacy-patient",
            email="legacy-patient@example.com",
            role="patient",
        )
        user.password = "Test-password-123"
        db.session.add(user)
        db.session.commit()
        user_id = user.id

    response = client.patch(
        f"/api/patients/{user_id}",
        headers={"Authorization": f"Bearer {token_for(admin)}"},
        json={"name": "Legacy Patient", "age": 42, "gender": "Other"},
    )

    assert response.status_code == 200
    patient_data = response.get_json()
    assert patient_data["user_id"] == user_id
    assert patient_data["patient_id"] is not None
    assert patient_data["name"] == "Legacy Patient"


def test_admin_can_delete_patient_without_linked_records(
    app, client, make_user, token_for
):
    admin, _ = make_user("admin", username="delete-patient-admin")
    patient_user, patient_profile = make_user(
        "patient", username="delete-patient-user"
    )
    assert patient_user.patient is patient_profile
    user_id = patient_user.id
    patient_id = patient_profile.id

    response = client.delete(
        f"/api/patients/{user_id}",
        headers={"Authorization": f"Bearer {token_for(admin)}"},
    )

    assert response.status_code == 204
    with app.app_context():
        assert db.session.get(User, user_id) is None
        assert db.session.get(Patient, patient_id) is None


def test_admin_cannot_delete_patient_with_medical_history(
    app, client, make_user, token_for
):
    admin, _ = make_user("admin", username="keep-history-admin")
    patient_user, patient_profile = make_user(
        "patient", username="keep-history-patient"
    )
    db.session.add(
        MedicalRecord(
            patient_id=patient_profile.id,
            diagnosis="Existing diagnosis",
            treatment="Existing treatment",
        )
    )
    db.session.commit()

    response = client.delete(
        f"/api/patients/{patient_user.id}",
        headers={"Authorization": f"Bearer {token_for(admin)}"},
    )

    assert response.status_code == 409
    assert "clinical or billing records" in response.get_json()["errors"][0]


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
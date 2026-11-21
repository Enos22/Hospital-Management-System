import pytest

from app.extensions import db
from app.models.doctor import Doctor
from app.models.user import User
from app.models.speciality import Speciality


def test_create_doctor(app):
    with app.app_context():

        user = User(
            name="John Doe",
            email="john@example.com",
            password="password123"
        )

        speciality = Speciality(
            name="Cardiology"
        )

        db.session.add(user)
        db.session.add(speciality)
        db.session.commit()

        doctor = Doctor(
            user_id=user.id,
            speciality_id=speciality.id,
            qualification="MBChB",
            phone_number="+254712345678",
            availability_status=True,
            license_number="LIC123456"
        )

        db.session.add(doctor)
        db.session.commit()

        saved_doctor = Doctor.query.first()

        assert saved_doctor is not None
        assert saved_doctor.user_id == user.id
        assert saved_doctor.speciality_id == speciality.id
        assert saved_doctor.qualification == "MBChB"
        assert saved_doctor.phone_number == "+254712345678"
        assert saved_doctor.availability_status is True
        assert saved_doctor.license_number == "LIC123456"


def test_doctor_relationships(app):
    with app.app_context():

        user = User(
            name="Jane Doe",
            email="jane@example.com",
            password="password123"
        )

        speciality = Speciality(
            name="Neurology"
        )

        db.session.add_all([user, speciality])
        db.session.commit()

        doctor = Doctor(
            user_id=user.id,
            speciality_id=speciality.id,
            qualification="MMed",
            phone_number="+254799999999",
            license_number="LIC999999"
        )

        db.session.add(doctor)
        db.session.commit()

        assert doctor.user == user
        assert doctor.speciality == speciality
        assert doctor.speciality.name == "Neurology"


def test_admin_can_link_existing_doctor_account_to_profile(
    app, client, make_user, token_for
):
    admin, _ = make_user("admin", username="doctor-profile-admin")
    with app.app_context():
        existing_user = User(
            username="existing-doctor",
            email="existing-doctor@example.com",
            role="doctor",
        )
        existing_user.password = "Test-password-123"
        speciality = Speciality(name="Family Medicine")
        db.session.add_all([existing_user, speciality])
        db.session.commit()
        existing_user_id = existing_user.id
        speciality_id = speciality.id

    response = client.post(
        "/api/doctors",
        headers={"Authorization": f"Bearer {token_for(admin)}"},
        json={
            "username": "existing-doctor",
            "speciality_id": speciality_id,
        },
    )

    assert response.status_code == 201
    doctor_data = response.get_json()
    assert doctor_data["user_id"] == existing_user_id
    assert doctor_data["doctor_id"] is not None
    assert doctor_data["speciality_id"] == speciality_id


def test_admin_can_list_specialities(client, make_user, token_for):
    admin, _ = make_user("admin", username="speciality-list-admin")
    db.session.add(
        Speciality(
            name="Ophthalmology",
            description="Eye care",
        )
    )
    db.session.commit()

    response = client.get(
        "/api/specialities",
        headers={"Authorization": f"Bearer {token_for(admin)}"},
    )

    assert response.status_code == 200
    speciality = next(
        item
        for item in response.get_json()
        if item["name"] == "Ophthalmology"
    )
    assert speciality["id"] is not None
    assert speciality["description"] == "Eye care"


def test_speciality_list_requires_admin(client, make_user, token_for):
    doctor, _ = make_user("doctor", username="speciality-list-doctor")

    response = client.get(
        "/api/specialities",
        headers={"Authorization": f"Bearer {token_for(doctor)}"},
    )

    assert response.status_code == 403


def test_new_doctor_requires_secure_password(client, make_user, token_for):
    admin, _ = make_user("admin", username="doctor-password-admin")
    speciality = Speciality(name="General Medicine")
    db.session.add(speciality)
    db.session.commit()

    response = client.post(
        "/api/doctors",
        headers={"Authorization": f"Bearer {token_for(admin)}"},
        json={
            "username": "new-doctor-no-password",
            "speciality_id": speciality.id,
        },
    )

    assert response.status_code == 422


def test_doctor_list_includes_clinical_profile_id(client, make_user, token_for):
    admin, _ = make_user("admin", username="doctor-list-admin")
    doctor, _ = make_user("doctor", username="doctor-list-entry")
    doctor_profile_id = doctor.doctor.id

    response = client.get(
        "/api/doctors",
        headers={"Authorization": f"Bearer {token_for(admin)}"},
    )

    assert response.status_code == 200
    listed_doctor = next(
        item for item in response.get_json() if item["user_id"] == doctor.id
    )
    assert listed_doctor["doctor_id"] == doctor_profile_id
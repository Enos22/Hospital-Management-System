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
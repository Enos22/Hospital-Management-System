import pytest
from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.speciality import Speciality
from app.models.user import User


@pytest.fixture
def app():
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "JWT_SECRET_KEY": "test-secret-key-with-at-least-32-bytes",
        }
    )

    with app.app_context():
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def make_user(app):
    def create_user(role="patient", username=None, email=None):
        username = username or f"{role}-user"
        user = User(
            username=username,
            email=email or f"{username}@example.com",
            role=role,
        )
        user.password = "Test-password-123"
        db.session.add(user)
        db.session.flush()

        patient = None
        if role == "patient":
            patient = Patient(
                user_id=user.id,
                name=username,
                age=30,
                gender="Other",
                email=user.email,
            )
            db.session.add(patient)
        elif role == "doctor":
            speciality = Speciality.query.filter_by(name="General").first()
            if speciality is None:
                speciality = Speciality(name="General")
                db.session.add(speciality)
                db.session.flush()
            db.session.add(
                Doctor(
                    user_id=user.id,
                    speciality_id=speciality.id,
                    qualification="MBChB",
                    phone_number=f"+254700{user.id:06d}",
                    license_number=f"LIC-{user.id}",
                )
            )
        db.session.commit()
        return user, patient

    return create_user


@pytest.fixture
def token_for(app):
    def create_token(user):
        with app.app_context():
            return create_access_token(
                identity=str(user.id),
                additional_claims={"role": user.role},
            )

    return create_token

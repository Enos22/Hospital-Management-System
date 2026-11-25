#Implements doctor CRUD operations, including registration, retrieval, updating and
#deletion of doctor profiles.

from flask import request
from flask_restful import Resource

from app.extensions import db
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.invoice import Invoice
from app.models.lab_request import LabRequest
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.prescription import Prescription
from app.models.speciality import Speciality
from app.models.user import User
from app.middleware.role_middleware import role_required
from app.schemas.user_schema import user_schema
from sqlalchemy.orm import joinedload
from sqlalchemy import delete


def doctor_to_dict(user):
    profile = user.doctor
    doctor_data = user_schema.dump(user)
    doctor_data.update(
        {
            "user_id": user.id,
            "doctor_id": profile.id if profile else None,
            "speciality_id": profile.speciality_id if profile else None,
            "speciality": (
                profile.speciality.name
                if profile and profile.speciality
                else None
            ),
        }
    )
    return doctor_data


class SpecialityList(Resource):
    @role_required("admin")
    def get(self):
        specialities = Speciality.query.order_by(Speciality.name.asc()).all()
        return [
            {
                "id": speciality.id,
                "name": speciality.name,
                "description": speciality.description,
            }
            for speciality in specialities
        ], 200

    @role_required("admin")
    def post(self):
        data = request.get_json(silent=True) or {}
        name = data.get("name")
        description = data.get("description")

        if not isinstance(name, str) or not name.strip():
            return {"errors": ["Speciality name is required"]}, 422
        name = name.strip()
        if len(name) > 100:
            return {"errors": ["Speciality name must be 100 characters or fewer"]}, 422
        if description is not None and not isinstance(description, str):
            return {"errors": ["Description must be text"]}, 422

        existing = Speciality.query.filter(
            db.func.lower(Speciality.name) == name.lower()
        ).first()
        if existing:
            return {"errors": ["Speciality already exists"]}, 409

        speciality = Speciality(
            name=name,
            description=description.strip() if description else None,
        )
        try:
            db.session.add(speciality)
            db.session.commit()
        except Exception as error:
            db.session.rollback()
            return {"errors": ["Could not create speciality"]}, 500

        return {
            "id": speciality.id,
            "name": speciality.name,
            "description": speciality.description,
        }, 201


class DoctorList(Resource):
    @role_required("admin", "doctor", "patient")
    def get(self):
        users = (
            User.query.options(
                joinedload(User.doctor).joinedload(Doctor.speciality)
            )
            .filter_by(role="doctor")
            .order_by(User.id.asc())
            .all()
        )
        return [doctor_to_dict(user) for user in users], 200

    @role_required("admin")
    def post(self):
        data = request.get_json(silent=True) or {}

        username = data.get("username")
        if isinstance(username, str):
            username = username.strip()
        if not username:
            return {"errors": ["Username is required"]}, 422

        try:
            speciality_id = int(data.get("speciality_id"))
        except (TypeError, ValueError):
            return {"errors": ["A valid speciality_id is required"]}, 422

        user = User.query.filter_by(username=username).first()
        if user and (user.role != "doctor" or user.doctor is not None):
            return {"errors": ["Username already belongs to a non-doctor or a profiled doctor"]}, 409

        speciality = db.session.get(Speciality, speciality_id)
        if speciality is None:
            return {"errors": ["Speciality not found"]}, 404

        email = data.get("email")
        if user is None:
            if not email:
                email = f"{username}@hospital.local"
            if User.query.filter_by(email=email).first():
                return {"errors": ["Email already exists"]}, 409

        try:
            if user is None:
                user = User(
                    username=username,
                    email=email,
                    role="doctor",
                )
                initial_password = f"doctor@{username}"
                user.password = initial_password
                db.session.add(user)
                db.session.flush()

            doctor = Doctor(
                user_id=user.id,
                speciality_id=speciality.id,
                qualification=data.get("qualification") or "Not provided",
                phone_number=data.get("phone_number") or f"UNASSIGNED-{user.id}",
                availability_status=True,
                license_number=data.get("license_number") or f"PENDING-{user.id}",
            )
            db.session.add(doctor)
            db.session.commit()

            response = doctor_to_dict(user)
            if initial_password:
                response["initial_password"] = initial_password
            return response, 201
        except Exception as e:
            db.session.rollback()
            return {"errors": [str(e)]}, 422

class DoctorDetail(Resource):
    @role_required("admin", "doctor", "patient")
    def get(self, id):
        user = db.session.get(User, id)
        if not user or user.role != "doctor":
            return {"errors": ["Doctor not found"]}, 404
        return doctor_to_dict(user), 200

    @role_required("admin")
    def patch(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "doctor":
            return {"errors": ["Doctor not Found"]}, 404
        data = request.get_json(silent=True) or {}

        updated_fields = {"username", "email", "speciality_id"} & data.keys()
        if not updated_fields:
            return {"errors": ["No supported fields to update"]}, 400

        if "username" in data:
            username = data["username"]
            if not username:
                return {"errors": ["Username cannot be empty"]}, 400
            existing = User.query.filter_by(username=username).first()
            if existing is not None and existing.id != user.id:
                return {"errors": ["Username already exists"]}, 409
            user.username = username
        if "email" in data:
            email = data["email"]
            if not email:
                return {"errors": ["Email cannot be empty"]}, 400
            user.email = email
        if "speciality_id" in data:
            if user.doctor is None:
                return {"errors": ["Doctor profile is not linked"]}, 409
            try:
                speciality_id = int(data["speciality_id"])
            except (TypeError, ValueError):
                return {"errors": ["A valid speciality_id is required"]}, 422
            speciality = db.session.get(Speciality, speciality_id)
            if speciality is None:
                return {"errors": ["Speciality not found"]}, 404
            user.doctor.speciality_id = speciality.id
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"errors": ["Could not update the doctor"]}, 500
        return doctor_to_dict(user), 200

    @role_required("admin")
    def delete(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "doctor":
            return {"errors": ["Doctor not Found"]}, 404

        doctor = Doctor.query.filter_by(user_id=user.id).first()
        if doctor and any(
            model.query.filter_by(doctor_id=doctor.id).first()
            for model in (Appointment, LabRequest, Prescription)
        ):
            return {
                "errors": [
                    "Cannot delete this doctor because clinical records are linked to the profile."
                ]
            }, 409

        if Payment.query.filter_by(user_id=user.id).first():
            return {
                "errors": [
                    "Cannot delete this doctor because payment history is linked to the account."
                ]
            }, 409

        try:
            Notification.query.filter_by(user_id=user.id).delete(
                synchronize_session=False
            )
            Payment.query.filter_by(received_by=user.id).update(
                {"received_by": None}, synchronize_session=False
            )
            Invoice.query.filter_by(created_by=user.id).update(
                {"created_by": None}, synchronize_session=False
            )
            db.session.execute(delete(Doctor).where(Doctor.user_id == user.id))
            db.session.execute(delete(User).where(User.id == user.id))
            db.session.commit()
            return {}, 204
        except Exception:
            db.session.rollback()
            return {"errors": ["Could not delete the doctor account."]}, 500
        
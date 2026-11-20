#Implements doctor CRUD operations, including registration, retrieval, updating and
#deletion of doctor profiles.

from flask import request
from flask_restful import Resource

from app.extensions import db
from app.models.doctor import Doctor
from app.models.speciality import Speciality
from app.models.user import User
from app.middleware.role_middleware import role_required
from app.schemas.user_schema import user_schema, users_schema


class DoctorList(Resource):
    @role_required("admin", "doctor", "patient")
    def get(self):
        return users_schema.dump(User.query.filter_by(role="doctor").all()), 200

    @role_required("admin")
    def post(self):
        data = request.get_json(silent=True) or {}

        username = data.get("username")
        speciality_id = data.get("speciality_id")

        if not username:
            return {"errors": ["Username is required"]}, 422

        if User.query.filter_by(username=username).first():
            return {"errors": ["Username Exists"]}, 422

        speciality = Speciality.query.get(speciality_id)
        if speciality is None:
            return {"errors": ["Speciality not found"]}, 404

        try:
            user = User(username=username, email=data.get("email", f"{username}@hospital.local"), role="doctor")
            user.password = data.get("password", "doctor123")
            db.session.add(user)
            db.session.flush()

            doctor = Doctor(
                user_id=user.id,
                speciality_id=speciality.id,
                qualification=data.get("qualification", "MBChB"),
                phone_number=data.get("phone_number", "0700000000"),
                availability_status=True,
                license_number=data.get("license_number", f"DOC-{user.id:05d}")
            )
            db.session.add(doctor)
            db.session.commit()

            return user_schema.dump(user), 201
        except Exception as e:
            db.session.rollback()
            return {"errors": [str(e)]}, 422

class DoctorDetail(Resource):
    @role_required("admin", "doctor", "patient")
    def get(self, id):
        user = db.session.get(User, id)
        if not user or user.role != "doctor":
            return {"errors": ["Doctor not found"]}, 404
        return user_schema.dump(user), 200

    @role_required("admin")
    def patch(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "doctor":
            return {"errors": ["Doctor not Found"]}, 404
        data = request.get_json(silent=True) or {}

        updated_fields = {"username", "email"} & data.keys()
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
        db.session.commit()
        return user_schema.dump(user), 200

    @role_required("admin")
    def delete(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "doctor":
            return {"errors": ["Doctor not Found"]}, 404

        try:
            db.session.delete(user)
            db.session.commit()
            return{}, 204
        except Exception as e:
            db.session.rollback()
            return {"errors": ["Could not delete Doctor, They may have Active Records to their Account"]}, 409
        
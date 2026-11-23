from flask import request
from flask_restful import Resource
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import user_schema
from functools import wraps
from app.models.patient import Patient


def user_with_profile_ids(user):
    user_data = user_schema.dump(user)
    user_data["user_id"] = user.id
    user_data["patient_id"] = user.patient.id if user.patient else None
    user_data["doctor_id"] = user.doctor.id if user.doctor else None
    return user_data


def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorated(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") not in roles:
                return {"errors": ["Forbidden: You don't have permission"]}, 403
            return fn(*args, **kwargs)
        return decorated 
    return wrapper


class Signup(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        confirmation = data.get("password_confirmation")
        role = data.get("role", "patient")

        if not username:
            return {"error": ["Username is required"]}, 422

        if not email:
            return {"error": ["Email is required"]}, 422

        if not password:
            return {"error": ["Password is required"]}, 422

        if password != confirmation:
            return {"error": ["You have entered The Wrong password!"]}, 422

        if role not in {"doctor", "patient", "admin"}:
            return {"errors": ["Role Must be Doctor, Patient, or Admin"]}, 422

        if role == "admin":
            return {"errors": ["You cannot signup as Admin.Reach out to Super Admin for Assistance"]}, 403
        if role == "doctor":
            return {
                "errors": [
                    "Doctor accounts must be created by an administrator so a doctor profile can be assigned"
                ]
            }, 403

        patient_name = data.get("name")
        patient_age = data.get("age")
        patient_gender = data.get("gender")
        patient_phone_number = data.get("phone_number")
        patient_address = data.get("address")
        if not patient_name or patient_age in (None, "") or not patient_gender:
            return {
                "errors": ["Name, age, and gender must all be provided"]
            }, 422
        if (
            not isinstance(patient_name, str)
            or not patient_name.strip()
            or len(patient_name) > 100
        ):
            return {"errors": ["Name must be 100 characters or fewer"]}, 422
        try:
            patient_age = int(patient_age)
        except (TypeError, ValueError):
            return {"errors": ["Age must be a positive integer"]}, 422
        if patient_age < 1:
            return {"errors": ["Age must be a positive integer"]}, 422
        if (
            not isinstance(patient_gender, str)
            or not patient_gender.strip()
            or len(patient_gender) > 10
        ):
            return {"errors": ["Gender must be 10 characters or fewer"]}, 422
        if patient_phone_number is not None and (
            not isinstance(patient_phone_number, str)
            or len(patient_phone_number.strip()) > 15
        ):
            return {"errors": ["Phone number must be 15 characters or fewer"]}, 422
        if patient_address is not None and (
            not isinstance(patient_address, str)
            or len(patient_address.strip()) > 200
        ):
            return {"errors": ["Address must be 200 characters or fewer"]}, 422
        patient_phone_number = (
            patient_phone_number.strip() or None
            if patient_phone_number is not None
            else None
        )
        patient_address = (
            patient_address.strip() or None
            if patient_address is not None
            else None
        )

        if User.query.filter_by(username=username).first():
            return {"error": ["Username already Exists"]}, 422

        if User.query.filter_by(email=email).first():
            return {"error": ["Email already Exists"]}, 422

        try:
            user = User(
                username=username,
                email=email,
                role=role
            )
            user.password = password

            db.session.add(user)
            db.session.flush()

            patient = Patient(
                user_id=user.id,
                name=patient_name.strip(),
                age=patient_age,
                gender=patient_gender.strip(),
                phone_number=patient_phone_number,
                address=patient_address,
            )
            db.session.add(patient)

            db.session.commit()

            token = create_access_token(
                identity=str(user.id),
                additional_claims={"role": user.role}
            )

            return {**user_with_profile_ids(user), "access_token": token}, 201

        except Exception as exc:
            db.session.rollback()
            return {"errors": [str(exc)]}, 422

class Login(Resource):
    def post(self):
        data = request.get_json(silent =True) or {}
        user = User.query.filter_by(username=data.get("username")).first()
        password = data.get("password")

        if user and password and  user.authenticated(password):
            must_change_password = (
                user.role == "doctor" and password == f"doctor@{user.username}"
            )
            token = create_access_token(
                identity = str(user.id),
                additional_claims = {
                    "role": user.role,
                    "must_change_password": must_change_password,
                }
            )
            return {
                **user_with_profile_ids(user),
                "access_token": token,
                "must_change_password": must_change_password,
            }, 200
        return {"errors": ["Invalid Username or Password"]}, 401


class ChangePassword(Resource):
    @jwt_required()
    def post(self):
        user = db.session.get(User, int(get_jwt_identity()))
        if user is None:
            return {"errors": ["Authentication required"]}, 401

        data = request.get_json(silent=True) or {}
        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not isinstance(current_password, str) or not user.authenticated(current_password):
            return {"errors": ["Current password is incorrect"]}, 400
        if not isinstance(new_password, str) or len(new_password) < 8:
            return {"errors": ["New password must be at least 8 characters"]}, 422
        if user.authenticated(new_password):
            return {"errors": ["New password must be different from the current password"]}, 422

        user.password = new_password
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"errors": ["Could not update password"]}, 500

        token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role,
                "must_change_password": False,
            },
        )
        return {
            **user_with_profile_ids(user),
            "access_token": token,
            "must_change_password": False,
        }, 200

class Logout(Resource):
    def delete(self):
        # front delets jwt token 
        return {}, 204

class Checksession(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)

        if user is None:
            return {"errors": ["Authentication required"]}, 401

        return {
            **user_with_profile_ids(user),
            "must_change_password": bool(get_jwt().get("must_change_password")),
        }, 200
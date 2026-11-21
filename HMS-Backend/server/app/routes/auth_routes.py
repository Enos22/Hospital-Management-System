from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
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
        has_patient_details = any(
            value not in (None, "") for value in (patient_name, patient_age, patient_gender)
        )
        if has_patient_details:
            if not patient_name or patient_age in (None, "") or not patient_gender:
                return {
                    "errors": ["Name, age, and gender must all be provided"]
                }, 422
            try:
                patient_age = int(patient_age)
            except (TypeError, ValueError):
                return {"errors": ["Age must be a positive integer"]}, 422
            if patient_age < 1:
                return {"errors": ["Age must be a positive integer"]}, 422
            if len(str(patient_gender)) > 10:
                return {"errors": ["Gender must be 10 characters or fewer"]}, 422

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

            if has_patient_details:
                patient = Patient(
                    user_id=user.id,
                    name=patient_name,
                    age=patient_age,
                    gender=patient_gender
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
            token = create_access_token(
                identity = str(user.id),
                additional_claims = {"role": user.role}
            )
            return {**user_with_profile_ids(user), "access_token": token}, 200
        return {"errors": ["Invalid Username or Password"]}, 401

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

        return user_with_profile_ids(user), 200
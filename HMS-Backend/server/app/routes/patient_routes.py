from flask import request
from flask_restful import Resource
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from app.extensions import db
from app.models.user import User
from app.models.patient import Patient
from app.schemas.user_schema import user_schema
from app.middleware.role_middleware import role_required
from sqlalchemy import or_
from sqlalchemy.orm import joinedload


def validate_patient_details(data, require_all=True):
    fields = ("name", "age", "gender")
    values = {field: data.get(field) for field in fields}

    if require_all and any(value in (None, "") for value in values.values()):
        return None, "Name, age, and gender must all be provided"
    if not require_all and not any(value is not None for value in values.values()):
        return None, None
    if values["name"] is not None and (
        not isinstance(values["name"], str)
        or not values["name"].strip()
        or len(values["name"]) > 100
    ):
        return None, "Name must be between 1 and 100 characters"
    if values["age"] is not None:
        try:
            values["age"] = int(values["age"])
        except (TypeError, ValueError):
            return None, "Age must be a positive integer"
        if values["age"] < 1:
            return None, "Age must be a positive integer"
    if values["gender"] is not None and (
        not isinstance(values["gender"], str)
        or not values["gender"].strip()
        or len(values["gender"]) > 10
    ):
        return None, "Gender must be between 1 and 10 characters"
    return values, None


def patient_to_dict(user):
    profile = user.patient
    patient_data = user_schema.dump(user)
    patient_data.update(
        {
            "user_id": user.id,
            "patient_id": profile.id if profile else None,
            "name": profile.name if profile else user.username,
            "age": profile.age if profile else None,
            "gender": profile.gender if profile else None,
        }
    )
    return patient_data

class PatientList(Resource):
    @role_required("doctor", "admin")
    def get(self):
        #filta frm url-query and exract pagination
        page =request.args.get('page', default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)
        search_query = request.args.get('search', default=None, type=str)

        query = User.query.options(joinedload(User.patient)).filter_by(
            role="patient"
        )

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    User.username.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )
        query = query.order_by(User.created_at.desc())

        paginated_patients = query.paginate(page=page, per_page=per_page, error_out=False)

        patients = [
            patient_to_dict(user) for user in paginated_patients.items
        ]

        return {
            "patients": patients,
            "metadata": {
                "total_items": paginated_patients.total,
                "total_pages": paginated_patients.pages,
                "current_page": paginated_patients.page,
                "per_page": paginated_patients.per_page,
                "has_next": paginated_patients.has_next,
                "has_prev": paginated_patients.has_prev
            }
        }, 200
    @role_required("admin")
    def post(self):
        data = request.get_json(silent=True) or {}
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        if not username or not email or not password:
            return {"errors": ["Username, email, and password are required"]}, 422
        patient_details, validation_error = validate_patient_details(data)
        if validation_error:
            return {"errors": [validation_error]}, 422
        
        if User.query.filter_by(username= username, role="patient").first():
            return {"errors": ["Username exists"]}, 422
        if User.query.filter_by(email=email).first():
            return {"errors": ["Email exists"]}, 422
        try:
            user = User(username=username, email=email, role="patient")
            user.password = password
            db.session.add(user)
            db.session.flush()
            db.session.add(
                Patient(
                    user_id=user.id,
                    name=patient_details["name"].strip(),
                    age=patient_details["age"],
                    gender=patient_details["gender"].strip(),
                )
            )
            db.session.commit()

            return patient_to_dict(user), 201
        except Exception as e:
            db.session.rollback()
            return {"errors": [str(e)]}, 422

class PatientDetail(Resource):
    @jwt_required()
    def get(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "patient":
            return {"errors": ["Patient Not Found"]}, 404
        role = get_jwt().get("role")
        if role not in {"doctor", "admin", "patient"}:
            return {"errors": ["You are not allowed to view this patient"]}, 403
        if role == "patient" and str(user.id) != str(get_jwt_identity()):
            return {"errors": ["You are not allowed to view this patient"]}, 403
        return patient_to_dict(user), 200
    
    @jwt_required()
    def patch(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "patient":
            return {"errors": ["Patient Not Found"]}, 404
        role = get_jwt().get("role")
        if role != "admin" and not (
            role == "patient" and str(user.id) == str(get_jwt_identity())
        ):
            return {"errors": ["You are not allowed to update this patient"]}, 403
        
        data = request.get_json(silent=True) or {}
        if not data:
            return {"errors": ["No update data provided"]}, 400
        patient_details, validation_error = validate_patient_details(
            data,
            require_all=user.patient is None,
        )
        if validation_error:
            return {"errors": [validation_error]}, 422
        try:
            if "username" in data:
                user.username = data["username"]

            if "password" in data:
                user.password = data["password"]

            if "email" in data:
                user.email = data["email"]
            if user.patient is None:
                user.patient = Patient(
                    name=patient_details["name"].strip(),
                    age=patient_details["age"],
                    gender=patient_details["gender"].strip(),
                )
            elif patient_details:
                for field, value in patient_details.items():
                    if value is not None:
                        setattr(
                            user.patient,
                            field,
                            value.strip() if isinstance(value, str) else value,
                        )
            db.session.commit()
            return patient_to_dict(user), 200
        except Exception as e:
            db.session.rollback()
            return {"errors": [str(e)]}, 422

    @role_required("admin")
    def delete(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "patient":
            return {"errors": ["Patient Not FoUnd"]}, 404
        try:
            db.session.delete(user)
            db.session.commit()
            return {}, 204
        except Exception as e:
            db.session.rollback()
            return {"errors": [str(e)]}, 422

        # implement patient deletion via DELETE endpoint
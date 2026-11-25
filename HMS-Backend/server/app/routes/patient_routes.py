from flask import request
from flask_restful import Resource
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from app.extensions import db
from app.models.user import User
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.invoice import Invoice
from app.models.lab_request import LabRequest
from app.models.lab_result import LabResult
from app.models.medical_record import MedicalRecord
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.prescription import Prescription
from app.schemas.user_schema import user_schema
from app.middleware.role_middleware import role_required
from sqlalchemy import delete, or_
from sqlalchemy.orm import joinedload


def validate_patient_details(data, require_all=True):
    fields = ("name", "age", "gender", "phone_number", "address")
    values = {field: data.get(field) for field in fields}

    required_fields = ("name", "age", "gender")
    if require_all and any(values[field] in (None, "") for field in required_fields):
        return None, "Name, age, and gender must all be provided"
    if not require_all and not any(field in data for field in fields):
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
    if values["phone_number"] is not None and (
        not isinstance(values["phone_number"], str)
        or len(values["phone_number"].strip()) > 15
    ):
        return None, "Phone number must be 15 characters or fewer"
    if values["address"] is not None and (
        not isinstance(values["address"], str)
        or len(values["address"].strip()) > 200
    ):
        return None, "Address must be 200 characters or fewer"
    for field in ("phone_number", "address"):
        if values[field] is not None:
            values[field] = values[field].strip() or None
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
            "phone_number": profile.phone_number if profile else None,
            "address": profile.address if profile else None,
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
                    phone_number=patient_details["phone_number"],
                    address=patient_details["address"],
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
        if role == "doctor":
            data = request.get_json(silent=True) or {}
            if not data:
                return {"errors": ["No update data provided"]}, 400
            allowed_fields = {"phone_number", "address"}
            if not set(data).issubset(allowed_fields):
                return {
                    "errors": ["Doctors may update only patient phone number and address"]
                }, 403
            if user.patient is None:
                return {"errors": ["Patient profile not found"]}, 404

            patient_details, validation_error = validate_patient_details(
                data,
                require_all=False,
            )
            if validation_error:
                return {"errors": [validation_error]}, 422
            try:
                for field in allowed_fields:
                    if field in data:
                        setattr(user.patient, field, patient_details[field])
                db.session.commit()
                return patient_to_dict(user), 200
            except Exception as e:
                db.session.rollback()
                return {"errors": [str(e)]}, 422

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
                    phone_number=patient_details["phone_number"],
                    address=patient_details["address"],
                )
            elif patient_details:
                for field, value in patient_details.items():
                    if field in data:
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

        patient = Patient.query.filter_by(user_id=user.id).first()
        if patient:
            has_clinical_history = any(
                model.query.filter_by(patient_id=patient.id).first()
                for model in (
                    Appointment,
                    Invoice,
                    LabRequest,
                    LabResult,
                    MedicalRecord,
                    Prescription,
                )
            )
            if has_clinical_history:
                return {
                    "errors": [
                        "Cannot delete this patient because clinical or billing records are linked to the profile."
                    ]
                }, 409

        if Payment.query.filter_by(user_id=user.id).first():
            return {
                "errors": [
                    "Cannot delete this patient because payment history is linked to the account."
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
            db.session.execute(delete(Patient).where(Patient.user_id == user.id))
            db.session.execute(delete(User).where(User.id == user.id))
            db.session.commit()
            return {}, 204
        except Exception:
            db.session.rollback()
            return {"errors": ["Could not delete the patient account."]}, 500
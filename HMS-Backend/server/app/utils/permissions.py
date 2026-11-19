from flask_jwt_extended import get_jwt, get_jwt_identity

from app.models.patient import Patient


def can_access_patient_data(patient_id):
    role = get_jwt().get("role")
    if role in {"doctor", "admin"}:
        return True
    return role == "patient" and Patient.query.filter_by(
        id=patient_id, user_id=int(get_jwt_identity())
    ).first() is not None


def current_patient():
    if get_jwt().get("role") != "patient":
        return None
    return Patient.query.filter_by(user_id=int(get_jwt_identity())).first()

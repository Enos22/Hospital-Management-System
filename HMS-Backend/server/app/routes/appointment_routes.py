from datetime import datetime, time
from datetime import timedelta

from flask import Blueprint, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from app.extensions import db
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.utils.conflict_checker import check_appointment_conflict
from app.utils.responses import error_response, success_response

appointment_bp = Blueprint("appointment_bp", __name__, url_prefix="/api/appointments")


def can_access_appointment(patient_id, doctor_id):
    role = get_jwt().get("role")
    if role == "admin":
        return True
    identity = int(get_jwt_identity())
    if role == "patient":
        return Patient.query.filter_by(id=patient_id, user_id=identity).first() is not None
    if role == "doctor":
        return Doctor.query.filter_by(id=doctor_id, user_id=identity).first() is not None
    return False


@appointment_bp.route("", methods=["POST"])
@jwt_required()
def create_appointment():
    data = request.get_json(silent=True) or {}

    required_fields = ["patient_id", "doctor_id", "appointment_date", "start_time", "end_time"]
    missing = [field for field in required_fields if data.get(field) in (None, "")]
    if missing:
        return error_response(f"Missing required fields: {', '.join(missing)}", 400)

    try:
        patient_id = int(data["patient_id"])
        doctor_id = int(data["doctor_id"])
        appointment_date = datetime.strptime(data["appointment_date"], "%Y-%m-%d").date()
        start_time = data["start_time"]
        end_time = data["end_time"]
        start_dt = datetime.strptime(start_time, "%H:%M")
        end_dt = datetime.strptime(end_time, "%H:%M")

        if end_dt <= start_dt:
            return error_response("End time must be later than start time", 400)
    except ValueError:
        return error_response("Invalid appointment date or time", 400)

    role = get_jwt().get("role")
    if role not in {"admin", "doctor", "patient"}:
        return error_response("You are not allowed to book appointments", 403)
    if not can_access_appointment(patient_id, doctor_id):
        return error_response("You are not allowed to book for this patient or doctor", 403)

    duration_minutes = int((end_dt - start_dt).total_seconds() // 60)
    conflict = check_appointment_conflict(
        doctor_id=doctor_id,
        patient_id=patient_id,
        appointment_date=appointment_date.isoformat(),
        start_time=start_time,
        duration_minutes=duration_minutes,
    )

    if conflict["has_conflict"]:
        return error_response(conflict["message"], 409)

    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=doctor_id,
        appointment_date=datetime.combine(appointment_date, time.min),
        appointment_time=time.fromisoformat(start_time),
        status="scheduled",
    )

    db.session.add(appointment)
    db.session.commit()

    return success_response({"appointment": appointment.to_dict()}, "Appointment created successfully", 201)


@appointment_bp.route("", methods=["GET"])
@jwt_required()
def get_appointments():
    patient_id = request.args.get("patient_id", type=int)
    doctor_id = request.args.get("doctor_id", type=int)
    date = request.args.get("appointment_date")

    role = get_jwt().get("role")
    query = Appointment.query
    identity = int(get_jwt_identity())
    if role == "patient":
        patient = Patient.query.filter_by(user_id=identity).first()
        if patient is None:
            return error_response("Patient profile not found", 403)
        if patient_id is not None and patient_id != patient.id:
            return error_response("You are not allowed to view these appointments", 403)
        query = query.filter_by(patient_id=patient.id)
    elif role == "doctor":
        doctor = Doctor.query.filter_by(user_id=identity).first()
        if doctor is None:
            return error_response("Doctor profile not found", 403)
        if doctor_id is not None and doctor_id != doctor.id:
            return error_response("You are not allowed to view these appointments", 403)
        query = query.filter_by(doctor_id=doctor.id)
    elif role != "admin":
        return error_response("You are not allowed to view appointments", 403)

    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    if doctor_id:
        query = query.filter_by(doctor_id=doctor_id)
    if date:
        try:
            day = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return error_response("Invalid appointment date", 400)
        query = query.filter(
            Appointment.appointment_date >= datetime.combine(day, time.min),
            Appointment.appointment_date < datetime.combine(day, time.min) + timedelta(days=1),
        )

    appointments = query.order_by(Appointment.id.desc()).all()
    return success_response([item.to_dict() for item in appointments], "Appointments retrieved successfully", 200)


@appointment_bp.route("/<int:appointment_id>", methods=["GET"])
@jwt_required()
def get_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)
    if not can_access_appointment(appointment.patient_id, appointment.doctor_id):
        return error_response("You are not allowed to view this appointment", 403)

    return success_response({"appointment": appointment.to_dict()}, "Appointment retrieved successfully", 200)


@appointment_bp.route("/<int:appointment_id>", methods=["PUT"])
@jwt_required()
def update_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)

    role = get_jwt().get("role")
    if role not in {"admin", "doctor"} or not can_access_appointment(
        appointment.patient_id, appointment.doctor_id
    ):
        return error_response("You are not allowed to update this appointment", 403)

    data = request.get_json(silent=True) or {}
    patient_id = data.get("patient_id", appointment.patient_id)
    doctor_id = data.get("doctor_id", appointment.doctor_id)
    appointment_date = appointment.appointment_date.date()
    appointment_time = appointment.appointment_time
    if "appointment_date" in data:
        try:
            day = datetime.strptime(data["appointment_date"], "%Y-%m-%d").date()
        except (TypeError, ValueError):
            return error_response("Invalid appointment date", 400)
        appointment_date = day
    if "appointment_time" in data:
        try:
            appointment_time = time.fromisoformat(data["appointment_time"])
        except (TypeError, ValueError):
            return error_response("Invalid appointment time", 400)
    if role == "doctor" and doctor_id != appointment.doctor_id:
        return error_response("A doctor cannot transfer an appointment", 403)

    conflict = check_appointment_conflict(
        doctor_id=doctor_id,
        patient_id=patient_id,
        appointment_date=appointment_date.isoformat(),
        start_time=appointment_time.strftime("%H:%M"),
        exclude_appointment_id=appointment.id,
    )
    if conflict["has_conflict"]:
        return error_response(conflict["message"], 409)

    appointment.patient_id = patient_id
    appointment.doctor_id = doctor_id
    appointment.appointment_date = datetime.combine(appointment_date, time.min)
    appointment.appointment_time = appointment_time
    if "status" in data:
        appointment.status = data["status"]

    db.session.commit()
    return success_response({"appointment": appointment.to_dict()}, "Appointment updated successfully", 200)


@appointment_bp.route("/<int:appointment_id>/cancel", methods=["PATCH"])
@jwt_required()
def cancel_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)
    if not can_access_appointment(appointment.patient_id, appointment.doctor_id):
        return error_response("You are not allowed to cancel this appointment", 403)

    appointment.status = "cancelled"
    db.session.commit()
    return success_response({"appointment": appointment.to_dict()}, "Appointment cancelled successfully", 200)

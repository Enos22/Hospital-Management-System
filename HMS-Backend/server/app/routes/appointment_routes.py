from datetime import datetime

from flask import Blueprint, request

from app.extensions import db
from app.models.appointment import Appointment
from app.utils.conflict_checker import check_appointment_conflict
from app.utils.responses import error_response, success_response

appointment_bp = Blueprint("appointment_bp", __name__, url_prefix="/api/appointments")


@appointment_bp.route("", methods=["POST"])
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
        appointment_date=appointment_date,
        start_time=start_time,
        end_time=end_time,
        reason=data.get("reason", ""),
        status="scheduled",
    )

    db.session.add(appointment)
    db.session.commit()

    return success_response({"appointment": appointment.to_dict()}, "Appointment created successfully", 201)


@appointment_bp.route("", methods=["GET"])
def get_appointments():
    patient_id = request.args.get("patient_id")
    doctor_id = request.args.get("doctor_id")
    date = request.args.get("appointment_date")

    query = Appointment.query
    if patient_id:
        query = query.filter_by(patient_id=int(patient_id))
    if doctor_id:
        query = query.filter_by(doctor_id=int(doctor_id))
    if date:
        query = query.filter_by(appointment_date=datetime.strptime(date, "%Y-%m-%d").date())

    appointments = query.order_by(Appointment.id.desc()).all()
    return success_response([item.to_dict() for item in appointments], "Appointments retrieved successfully", 200)


@appointment_bp.route("/<int:appointment_id>", methods=["GET"])
def get_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)

    return success_response({"appointment": appointment.to_dict()}, "Appointment retrieved successfully", 200)


@appointment_bp.route("/<int:appointment_id>", methods=["PUT"])
def update_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)

    data = request.get_json(silent=True) or {}
    for field in ["patient_id", "doctor_id", "appointment_date", "start_time", "end_time", "reason", "status"]:
        if field in data:
            if field == "appointment_date":
                appointment.appointment_date = datetime.strptime(data[field], "%Y-%m-%d").date()
            else:
                setattr(appointment, field, data[field])

    db.session.commit()
    return success_response({"appointment": appointment.to_dict()}, "Appointment updated successfully", 200)


@appointment_bp.route("/<int:appointment_id>/cancel", methods=["PATCH"])
def cancel_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)

    appointment.status = "cancelled"
    db.session.commit()
    return success_response({"appointment": appointment.to_dict()}, "Appointment cancelled successfully", 200)

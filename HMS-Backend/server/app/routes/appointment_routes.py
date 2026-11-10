from flask import Blueprint, jsonify, request
from antony.services.appointment_service import AppointmentService
from antony.utils.validators import validate_appointment_input
from antony.utils.responses import success_response, error_response

appointment_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

@appointment_bp.route('', methods=['POST'])
def create_appointment():
    """Create a new appointment[cite: 7]."""
    data = request.get_json()
    
    # Validate input fields, dates, and times
    validation_error = validate_appointment_input(data)
    if validation_error:
        return error_response(message=validation_error, status_code=400)
    
    try:
        new_appointment = AppointmentService.create_appointment(data)
        return success_response(
            data=new_appointment.to_dict(), 
            message="Appointment created successfully", 
            status_code=201
        )
    except ValueError as e:
        return error_response(message=str(e), status_code=409)  # Conflict/Double-booking prevention error
    except Exception as e:
        return error_response(message="An internal error occurred", status_code=500)

@appointment_bp.route('', methods=['GET'])
def get_appointments():
    """Retrieve all appointments or filter by patient/doctor[cite: 7]."""
    patient_id = request.args.get('patient_id')
    doctor_id = request.args.get('doctor_id')
    
    appointments = AppointmentService.get_appointments(patient_id=patient_id, doctor_id=doctor_id)
    return success_response(data=[apt.to_dict() for apt in appointments], status_code=200)

@appointment_bp.route('/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Retrieve a specific appointment by ID[cite: 7]."""
    appointment = AppointmentService.get_appointment_by_id(appointment_id)
    if not appointment:
        return error_response(message="Appointment not found", status_code=404)
        
    return success_response(data=appointment.to_dict(), status_code=200)

@appointment_bp.route('/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update appointment details[cite: 7]."""
    data = request.get_json()
    
    try:
        updated_appointment = AppointmentService.update_appointment(appointment_id, data)
        if not updated_appointment:
            return error_response(message="Appointment not found", status_code=404)
            
        return success_response(
            data=updated_appointment.to_dict(), 
            message="Appointment updated successfully", 
            status_code=200
        )
    except ValueError as e:
        return error_response(message=str(e), status_code=400)

@appointment_bp.route('/<int:appointment_id>/reschedule', methods=['PATCH'])
def reschedule_appointment(appointment_id):
    """Reschedule an existing appointment[cite: 7]."""
    data = request.get_json()
    new_date = data.get('date')
    new_time = data.get('time')
    
    if not new_date or not new_time:
        return error_response(message="New date and time are required for rescheduling", status_code=400)
        
    try:
        rescheduled = AppointmentService.reschedule_appointment(appointment_id, new_date, new_time)
        if not rescheduled:
            return error_response(message="Appointment not found", status_code=404)
            
        return success_response(
            data=rescheduled.to_dict(), 
            message="Appointment rescheduled successfully", 
            status_code=200
        )
    except ValueError as e:
        return error_response(message=str(e), status_code=409)

@appointment_bp.route('/<int:appointment_id>/cancel', methods=['PATCH'])
def cancel_appointment(appointment_id):
    """Cancel an appointment[cite: 7]."""
    try:
        cancelled = AppointmentService.cancel_appointment(appointment_id)
        if not cancelled:
            return error_response(message="Appointment not found", status_code=404)
            
        return success_response(
            message="Appointment cancelled successfully", 
            status_code=200
        )
    except Exception as e:
        return error_response(message=str(e), status_code=400)
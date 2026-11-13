from datetime import datetime

def validate_appointment_creation(data):
    """
    Validates the incoming payload for creating a new appointment.
    Required fields: patient_id, doctor_id, appointment_date, start_time, end_time
    """
    errors = {}
    
    # Check required fields
    required_fields = ['patient_id', 'doctor_id', 'appointment_date', 'start_time', 'end_time']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"The field '{field}' is required."

    if errors:
        return False, errors

    # Validate IDs are integers or valid identifiers
    try:
        patient_id = int(data['patient_id'])
        doctor_id = int(data['doctor_id'])
        if patient_id <= 0 or doctor_id <= 0:
            raise ValueError
    except (ValueError, TypeError):
        errors['ids'] = "patient_id and doctor_id must be valid positive integers."

    # Validate Date format (YYYY-MM-DD)
    date_str = data.get('appointment_date')
    try:
        parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        # Optional: Prevent booking in the past
        if parsed_date < datetime.now().date():
            errors['appointment_date'] = "Appointment date cannot be in the past."
    except ValueError:
        errors['appointment_date'] = "Invalid date format. Expected YYYY-MM-DD."

    # Validate Time format (HH:MM or HH:MM:SS)
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')
    
    parsed_start = parse_time(start_time_str)
    parsed_end = parse_time(end_time_str)

    if not parsed_start:
        errors['start_time'] = "Invalid start_time format. Expected HH:MM (24-hour)."
    if not parsed_end:
        errors['end_time'] = "Invalid end_time format. Expected HH:MM (24-hour)."

    # Ensure start time is before end time
    if parsed_start and parsed_end:
        if parsed_start >= parsed_end:
            errors['time_range'] = "Start time must be earlier than end time."

    if errors:
        return False, errors

    return True, None


def validate_appointment_update(data):
    """
    Validates fields when updating or rescheduling an appointment.
    Allows partial updates.
    """
    errors = {}

    # If date is provided, validate it
    if 'appointment_date' in data and data['appointment_date']:
        try:
            parsed_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
            if parsed_date < datetime.now().date():
                errors['appointment_date'] = "Appointment date cannot be in the past."
        except ValueError:
            errors['appointment_date'] = "Invalid date format. Expected YYYY-MM-DD."

    # If times are provided, validate them
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')

    parsed_start = parse_time(start_time_str) if start_time_str else None
    parsed_end = parse_time(end_time_str) if end_time_str else None

    if start_time_str and not parsed_start:
        errors['start_time'] = "Invalid start_time format. Expected HH:MM (24-hour)."
    if end_time_str and not parsed_end:
        errors['end_time'] = "Invalid end_time format. Expected HH:MM (24-hour)."

    if parsed_start and parsed_end and parsed_start >= parsed_end:
        errors['time_range'] = "Start time must be earlier than end time."

    # Validate status if provided
    valid_statuses = ['scheduled', 'completed', 'cancelled', 'rescheduled']
    if 'status' in data and data['status'] not in valid_statuses:
        errors['status'] = f"Invalid status. Must be one of: {', '.join(valid_statuses)}."

    if errors:
        return False, errors

    return True, None


def parse_time(time_str):
    """Helper to parse time strings in HH:MM or HH:MM:SS format."""
    if not isinstance(time_str, str):
        return None
    for fmt in ('%H:%M', '%H:%M:%S'):
        try:
            return datetime.strptime(time_str, fmt).time()
        except ValueError:
            continue
    return None
from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    """
    Returns a standardized success JSON response.

    :param data: The payload (dictionary, list, or object representation) to return.
    :param message: A human-readable success message.
    :param status_code: HTTP status code (default 200).
    """
    response = {
        "status": "success",
        "message": message,
    }

    if data is not None:
        if isinstance(data, dict):
            if "user" in data:
                data_key = "user"
                response[data_key] = data[data_key]
            elif "patient" in data:
                data_key = "patient"
                response[data_key] = data[data_key]
            elif "doctor" in data:
                data_key = "doctor"
                response[data_key] = data[data_key]
            elif "invoice" in data:
                data_key = "invoice"
                response[data_key] = data[data_key]
            elif "appointment" in data:
                data_key = "appointment"
                response[data_key] = data[data_key]
            elif "prescription" in data:
                data_key = "prescription"
                response[data_key] = data[data_key]
            elif "record" in data:
                data_key = "record"
                response[data_key] = data[data_key]
            elif "id" in data:
                data_key = "appointment"
                response[data_key] = data
            else:
                response["data"] = data
        else:
            response["data"] = data

    return jsonify(response), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    """
    Returns a standardized error JSON response.
    
    :param message: A human-readable description of the error.
    :param status_code: HTTP status code (default 400).
    :param errors: Optional dictionary or list containing granular validation errors.
    """
    response = {
        "status": "error",
        "message": message
    }
    if errors is not None:
        response["errors"] = errors
        
    return jsonify(response), status_code

def validation_error_response(errors):
    """
    Convenience wrapper specifically for input validation failures.
    
    :param errors: Dictionary or list of validation failure descriptions.
    """
    return error_response(
        message="Validation failed for appointment input", 
        status_code=422, 
        errors=errors
    )

def not_found_response(resource_name="Appointment"):
    """
    Convenience wrapper when a requested resource cannot be found.
    
    :param resource_name: Name of the missing entity.
    """
    return error_response(
        message=f"{resource_name} not found", 
        status_code=404
    )

def conflict_response(message="Scheduling conflict detected. The doctor or patient is already booked for this time slot."):
    """
    Convenience wrapper specifically for double-booking or slot conflicts.
    
    :param message: Custom conflict description.
    """
    return error_response(
        message=message, 
        status_code=409
    )
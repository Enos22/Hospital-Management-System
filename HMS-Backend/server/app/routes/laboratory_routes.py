from flask import request
from flask_restful import Resource

from app.services.laboratory_test_service import LaboratoryTestService
from app.middleware.role_middleware import role_required
from flask_jwt_extended import get_jwt, jwt_required
from app.utils.permissions import can_access_patient_data, current_patient


def test_to_dict(test):
    return {
        "id": test.id,
        "patient_id": test.patient_id,
        "doctor_id": test.doctor_id,
        "test_name": test.test_type,
        "status": test.status,
        "result": LaboratoryTestService.get_result(test),
        "created_at": test.created_at.isoformat() if test.created_at else None,
    }


class LaboratoryTestList(Resource):
    """Handles listing all laboratory tests (with filters and pagination) and creating new test requests."""

    @jwt_required()
    def get(self):
        """Fetch a paginated list of laboratory tests, optionally filtered by patient ID or status."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        patient_id = request.args.get("patient_id", type=int)
        status_filter = request.args.get("status", type=str)

        patient = current_patient()
        if patient is not None:
            if patient_id is not None and patient_id != patient.id:
                return {"message": "You are not allowed to view these laboratory tests"}, 403
            patient_id = patient.id
        elif get_jwt().get("role") not in {"doctor", "admin"}:
            return {"message": "You are not allowed to view laboratory tests"}, 403

        # Retrieve tests through the service layer
        paginated = LaboratoryTestService.get_all_tests(
            patient_id=patient_id,
            status=status_filter,
            page=page,
            per_page=per_page
        )

        return {
            "laboratory_tests": [
                test_to_dict(test)
                for test in paginated.items
            ],
            "metadata": {
                "total_items": paginated.total,
                "total_pages": paginated.pages,
                "current_page": paginated.page,
                "per_page": paginated.per_page,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev
            }
        }, 200

    @role_required("doctor", "admin")
    def post(self):
        """Validate incoming JSON data and create a new laboratory test request."""
        data = request.get_json()

        if not data:
            return {"message": "Please provide laboratory test details"}, 400

        # Ensure all mandatory fields are present and not empty
        required_fields = ["patient_id", "doctor_id", "test_name"]

        missing_fields = [
            field for field in required_fields
            if data.get(field) is None or data.get(field) == ""
        ]

        if missing_fields:
            return {
                "message": "Some required fields are missing",
                "missing_fields": missing_fields
            }, 400

        # Save the test request using the service layer
        try:
            test = LaboratoryTestService.create_test(data)
        except (TypeError, ValueError):
            return {"message": "Patient and doctor IDs must be valid integers"}, 400

        return {
            "message": "Laboratory test request created successfully",
            "laboratory_test": test_to_dict(test)
        }, 201


class LaboratoryTestDetail(Resource):
    """Handles retrieving and updating a single laboratory test by its ID."""

    @jwt_required()
    def get(self, test_id):
        """Fetch a specific laboratory test using its unique ID."""
        test = LaboratoryTestService.get_test_by_id(test_id)

        if not test:
            return {"message": "Laboratory test not found"}, 404
        if not can_access_patient_data(test.patient_id):
            return {"message": "You are not allowed to view this laboratory test"}, 403

        return {"laboratory_test": test_to_dict(test)}, 200

    @role_required("doctor", "admin")
    def patch(self, test_id):
        """Update specific allowed fields (status, result) on an existing laboratory test."""
        test = LaboratoryTestService.get_test_by_id(test_id)

        if not test:
            return {"message": "Laboratory test not found"}, 404

        data = request.get_json()

        if not data:
            return {"message": "Please provide details to update"}, 400

        # Restrict updates only to safe, allowed fields
        allowed_fields = {"status", "result"}

        update_data = {
            field: value
            for field, value in data.items()
            if field in allowed_fields
        }

        if not update_data:
            return {"message": "No valid update fields provided"}, 400

        # Apply updates via the service layer
        try:
            test = LaboratoryTestService.update_test(test, update_data)
        except ValueError as error:
            return {"message": str(error)}, 400

        return {
            "message": "Laboratory test updated successfully",
            "laboratory_test": test_to_dict(test)
        }, 200
from flask import request
from flask_jwt_extended import get_jwt, jwt_required
from flask_restful import Resource

from app.services.prescription_service import PrescriptionService
from app.models.prescription import Prescription
from app.middleware.role_middleware import role_required
from app.utils.permissions import can_access_patient_data, current_patient


class PrescriptionList(Resource):
    """Handles listing all prescriptions (with filters and pagination) and creating new prescriptions."""

    @jwt_required()
    def get(self):
        """Fetch a paginated list of prescriptions, optionally filtered by patient ID or doctor ID."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        patient_id = request.args.get("patient_id", type=int)
        doctor_id = request.args.get("doctor_id", type=int)

        patient = current_patient()
        if patient is not None:
            if patient_id is not None and patient_id != patient.id:
                return {"message": "You are not allowed to view these prescriptions"}, 403
            patient_id = patient.id
        elif get_jwt().get("role") not in {"doctor", "admin"}:
            return {"message": "You are not allowed to view prescriptions"}, 403

        # Retrieve prescriptions through the service layer
        paginated = PrescriptionService.get_all_prescriptions(
            patient_id=patient_id,
            doctor_id=doctor_id,
            page=page,
            per_page=per_page
        )

        return {
            "prescriptions": [
                {
                    "id": prescription.id,
                    "patient_id": prescription.patient_id,
                    "doctor_id": prescription.doctor_id,
                    "medicine_id": prescription.medicine_id,
                    "dosage": prescription.dosage,
                    "frequency": prescription.frequency,
                    "duration": prescription.duration,
                    "created_at": prescription.created_at.isoformat(),
                    "updated_at": prescription.updated_at.isoformat()
                }
                for prescription in paginated.items
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
        """Validate incoming JSON data and create a new prescription."""
        data = request.get_json()

        if not data:
            return {"message": "Please provide prescription details"}, 400

        # Ensure all mandatory fields are present and not empty
        required_fields = [
            "patient_id",
            "doctor_id",
            "medicine_id",
            "dosage",
            "frequency",
            "duration"
        ]

        missing_fields = [
            field for field in required_fields
            if data.get(field) is None or data.get(field) == ""
        ]

        if missing_fields:
            return {
                "message": "Some required fields are missing",
                "missing_fields": missing_fields
            }, 400

        # Save the prescription using the service layer
        prescription = PrescriptionService.create_prescription(data)

        return {
            "message": "Prescription created successfully",
            "prescription": {
                "id": prescription.id,
                "patient_id": prescription.patient_id,
                "doctor_id": prescription.doctor_id,
                "medicine_id": prescription.medicine_id,
                "dosage": prescription.dosage,
                "frequency": prescription.frequency,
                "duration": prescription.duration
            }
        }, 201


class PrescriptionDetail(Resource):
    """Handles retrieving, updating, and deleting a single prescription by its ID."""

    @jwt_required()
    def get(self, prescription_id):
        """Fetch a specific prescription using its unique ID."""
        prescription = PrescriptionService.get_prescription_by_id(
            prescription_id
        )

        if not prescription:
            return {"message": "Prescription not found"}, 404
        if not can_access_patient_data(prescription.patient_id):
            return {"message": "You are not allowed to view this prescription"}, 403

        return {
            "prescription": {
                "id": prescription.id,
                "patient_id": prescription.patient_id,
                "doctor_id": prescription.doctor_id,
                "medicine_id": prescription.medicine_id,
                "dosage": prescription.dosage,
                "frequency": prescription.frequency,
                "duration": prescription.duration
            }
        }, 200

    @role_required("doctor", "admin")
    def patch(self, prescription_id):
        """Update specific allowed fields on an existing prescription."""
        prescription = PrescriptionService.get_prescription_by_id(
            prescription_id
        )

        if not prescription:
            return {"message": "Prescription not found"}, 404

        data = request.get_json()

        if not data:
            return {"message": "Please provide details to update"}, 400

        # Restrict updates only to safe, allowed fields
        allowed_fields = {
            "patient_id",
            "doctor_id",
            "medicine_id",
            "dosage",
            "frequency",
            "duration"
        }

        update_data = {
            field: value
            for field, value in data.items()
            if field in allowed_fields
        }

        if not update_data:
            return {"message": "No valid fields provided for update"}, 400

        # Apply updates via the service layer
        prescription = PrescriptionService.update_prescription(
            prescription,
            update_data
        )

        return {
            "message": "Prescription updated successfully",
            "prescription": {
                "id": prescription.id,
                "patient_id": prescription.patient_id,
                "doctor_id": prescription.doctor_id,
                "medicine_id": prescription.medicine_id,
                "dosage": prescription.dosage,
                "frequency": prescription.frequency,
                "duration": prescription.duration
            }
        }, 200

    @role_required("admin")
    def delete(self, prescription_id):
        """Delete an existing prescription (restricted to admin role)."""
        prescription = PrescriptionService.get_prescription_by_id(
            prescription_id
        )

        if not prescription:
            return {"message": "Prescription not found"}, 404

        PrescriptionService.delete_prescription(prescription)

        return {"message": "Prescription deleted successfully"}, 200
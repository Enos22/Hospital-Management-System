
from flask import request
from flask_restful import Resource
from app.hamphly.services.prescription_service import PrescriptionService
from app.models.prescription import Prescription
from app.middleware.role_middleware import role_required

class PrescriptionList(Resource):

    # Retrieve prescriptions with optional filters and pagination
    @role_required("doctor", "admin")
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        patient_id = request.args.get("patient_id", type=int)
        doctor_id = request.args.get("doctor_id", type=int)

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
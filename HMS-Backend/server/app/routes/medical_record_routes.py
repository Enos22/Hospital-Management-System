from flask import request
from flask_restful import Resource

from extensions import db
from models.medical_record import MedicalRecord
from schemas.medical_record_schema import (
    medical_record_schema,
    medical_records_schema,
)
from middleware.role_middleware import role_required
from services.record_service import RecordService


class MedicalRecordList(Resource):

    @role_required("doctor", "admin")
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        patient_id = request.args.get("patient_id", type=int)
        search = request.args.get("search", type=str)

        paginated = RecordService.get_all_records(
            patient_id=patient_id, search=search, page=page, per_page=per_page
        )

        return {
            "medical_records": medical_records_schema.dump(paginated.items),
            "metadata": {
                "total_items": paginated.total,
                "total_pages": paginated.pages,
                "current_page": paginated.page,
                "per_page": paginated.per_page,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev,
            },
        }, 200

    @role_required("doctor", "admin")
    def post(self):
        data = request.get_json()
        if not data:
            return {"message": "Please provide medical record details"}, 400

        required = [
            "patient_id",
            "diagnosis",
            "symptoms",
            "treatment",
            "consultation_date",
        ]
        missing = [f for f in required if not data.get(f)]

        if missing:
            return {
                "message": "Some required fields are missing",
                "missing_fields": missing,
            }, 400

        # Load/validate data through Marshmallow schema, then pass to service
        validated_data = medical_record_schema.load(data)
        
        # If your schema returns a model instance on load:
        record = RecordService.create_record(data)

        return {
            "message": "Medical record created successfully",
            "medical_record": medical_record_schema.dump(record),
        }, 201


class MedicalRecordDetail(Resource):

    @role_required("doctor", "admin")
    def get(self, record_id):
        record = RecordService.get_record_by_id(record_id)
        if not record:
            return {"message": "Medical record not found"}, 404

        return {"medical_record": medical_record_schema.dump(record)}, 200

    @role_required("doctor", "admin")
    def patch(self, record_id):
        record = RecordService.get_record_by_id(record_id)
        if not record:
            return {"message": "Medical record not found"}, 404

        data = request.get_json()
        if not data:
            return {"message": "Please provide details to update"}, 400

        # Partially load data using marshmallow schema if desired, or pass raw dict
        updated_data = medical_record_schema.load(data, partial=True)
        
        # Using service to apply updates
        record = RecordService.update_record(record, data)

        return {
            "message": "Medical record updated successfully",
            "medical_record": medical_record_schema.dump(record),
        }, 200

    @role_required("admin")
    def delete(self, record_id):
        record = RecordService.get_record_by_id(record_id)
        if not record:
            return {"message": "Medical record not found"}, 404

        RecordService.delete_record(record)

        return {"message": "Medical record deleted successfully"}, 200


class PatientMedicalHistory(Resource):

    @role_required("doctor", "admin")
    def get(self, patient_id):
        records = RecordService.get_patient_history(patient_id)

        return {
            "patient_id": patient_id,
            "medical_history": medical_records_schema.dump(records),
        }, 200
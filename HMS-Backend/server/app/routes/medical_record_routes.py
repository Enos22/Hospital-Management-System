from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from flask_restful import Resource

from app.models.patient import Patient
from app.schemas.medical_record_schema import (
    medical_record_schema,
    medical_records_schema,
)
from app.middleware.role_middleware import role_required
from app.services.record_service import RecordService
from app.utils.permissions import can_access_patient_data, current_patient


def staff_only():
    return get_jwt().get("role") in {"doctor", "admin"}


class MedicalRecordList(Resource):

    @jwt_required()
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        patient_id = request.args.get("patient_id", type=int)
        search = request.args.get("search", type=str)

        if not staff_only():
            patient = current_patient()
            if get_jwt().get("role") != "patient" or patient is None:
                return {"message": "You are not allowed to view medical records"}, 403
            if patient_id is not None and patient_id != patient.id:
                return {"message": "You are not allowed to view these medical records"}, 403
            patient_id = patient.id

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
            "treatment",
        ]
        missing = [f for f in required if not data.get(f)]

        if missing:
            return {
                "message": "Some required fields are missing",
                "missing_fields": missing,
            }, 400

        validated_data = medical_record_schema.load(data)
        record = RecordService.create_record(validated_data)

        return {
            "message": "Medical record created successfully",
            "medical_record": medical_record_schema.dump(record),
        }, 201


class MedicalRecordDetail(Resource):

    @jwt_required()
    def get(self, record_id):
        record = RecordService.get_record_by_id(record_id)
        if not record:
            return {"message": "Medical record not found"}, 404
        if not can_access_patient_data(record.patient_id):
            return {"message": "You are not allowed to view this medical record"}, 403

        return {"medical_record": medical_record_schema.dump(record)}, 200

    @role_required("doctor", "admin")
    def patch(self, record_id):
        record = RecordService.get_record_by_id(record_id)
        if not record:
            return {"message": "Medical record not found"}, 404

        data = request.get_json()
        if not data:
            return {"message": "Please provide details to update"}, 400

        updated_data = medical_record_schema.load(data, partial=True)
        record = RecordService.update_record(
            record, {key: value for key, value in updated_data.items() if hasattr(record, key)}
        )

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

    @jwt_required()
    def get(self, patient_id):
        if not can_access_patient_data(patient_id):
            return {"message": "You are not allowed to view this medical history"}, 403
        records = RecordService.get_patient_history(patient_id)

        return {
            "patient_id": patient_id,
            "medical_history": medical_records_schema.dump(records),
        }, 200
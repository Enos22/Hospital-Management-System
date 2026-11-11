from flask import request
from flask_restful import Resource

from extensions import db
from models.medical_record import MedicalRecord
from schemas.medical_record_schema import (
    medical_record_schema,
    medical_records_schema,
)
from middleware.role_middleware import role_required


class MedicalRecordList(Resource):

    @role_required("doctor", "admin")
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        patient_id = request.args.get("patient_id", type=int)
        search = request.args.get("search", type=str)

        query = MedicalRecord.query

        if patient_id:
            query = query.filter_by(patient_id=patient_id)

        if search:
            query = query.filter(MedicalRecord.diagnosis.ilike(f"%{search}%"))

        paginated = query.order_by(MedicalRecord.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
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

        record = medical_record_schema.load(data)
        db.session.add(record)
        db.session.commit()

        return {
            "message": "Medical record created successfully",
            "medical_record": medical_record_schema.dump(record),
        }, 201


class MedicalRecordDetail(Resource):

    @role_required("doctor", "admin")
    def get(self, record_id):
        record = db.session.get(MedicalRecord, record_id)
        if not record:
            return {"message": "Medical record not found"}, 404

        return {"medical_record": medical_record_schema.dump(record)}, 200

    @role_required("doctor", "admin")
    def patch(self, record_id):
        record = db.session.get(MedicalRecord, record_id)
        if not record:
            return {"message": "Medical record not found"}, 404

        data = request.get_json()
        if not data:
            return {"message": "Please provide details to update"}, 400

        record = medical_record_schema.load(
            data, instance=record, partial=True
        )
        db.session.commit()

        return {
            "message": "Medical record updated successfully",
            "medical_record": medical_record_schema.dump(record),
        }, 200

    @role_required("admin")
    def delete(self, record_id):
        record = db.session.get(MedicalRecord, record_id)
        if not record:
            return {"message": "Medical record not found"}, 404

        db.session.delete(record)
        db.session.commit()

        return {"message": "Medical record deleted successfully"}, 200


class PatientMedicalHistory(Resource):

    @role_required("doctor", "admin")
    def get(self, patient_id):
        records = (
            MedicalRecord.query.filter_by(patient_id=patient_id)
            .order_by(MedicalRecord.created_at.desc())
            .all()
        )

        return {
            "patient_id": patient_id,
            "medical_history": medical_records_schema.dump(records),
        }, 200
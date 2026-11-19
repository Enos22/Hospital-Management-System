from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from app.extensions import db
from app.models.medical_record import MedicalRecord


class MedicalRecordSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = MedicalRecord
        sqla_session = db.session
        load_instance = False

    record_date = fields.DateTime(format="iso")
    patient_id = fields.Integer(required=True)


medical_record_schema = MedicalRecordSchema()
medical_records_schema = MedicalRecordSchema(many=True)

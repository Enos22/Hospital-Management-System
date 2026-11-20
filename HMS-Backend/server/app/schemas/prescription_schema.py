from marshmallow import fields, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from models.prescription import Prescription

class PrescriptionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Prescription
        load_instance = True
        include_fk = True

    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    doctor_id = fields.Int(required=True)
    medication_name = fields.Str(required=True)
    dosage = fields.Str(required=True)
    frequency = fields.Str(required=True)
    duration = fields.Str(required=True)
    @validates("dosage")
    def validate_dosage(self, value):
        if not value:
            raise ValidationError("Dosage is required.")

    @validates("frequency")
    def validate_frequency(self, value):
        if not value:
            raise ValidationError("Frequency is required.")
    @validates("duration")
    def validate_duration(self, value):
        if not value:
            raise ValidationError("Duration is required.")
    @validates("medication_name")
    def validate_medication_name(self, value):
        if not value:
            raise ValidationError("Medication name is required.")
    @validates("patient_id")
    def validate_patient_id(self, value):
        if not value:
            raise ValidationError("Patient ID is required.")
    @validates("doctor_id")
    def validate_doctor_id(self, value):
        if not value:
            raise ValidationError("Doctor ID is required.")
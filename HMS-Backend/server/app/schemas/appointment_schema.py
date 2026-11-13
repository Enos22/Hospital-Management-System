from datetime import datetime

from marshmallow import fields, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.appointment import Appointment

class AppointmentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Appointment
        load_instance = True
        include_fk = True

    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    doctor_id = fields.Int(required=True)
    appointment_date = fields.DateTime(required=True)
    status = fields.Str(required=True)

    @validates("status")
    def validate_status(self, value):
        if value not in ["scheduled", "completed", "cancelled"]:
            raise ValidationError(
                "Status must be one of: 'scheduled', 'completed', or 'cancelled'."
            )
    @validates("appointment_date")
    def validate_appointment_date(self, value):
        if value < datetime.now():
            raise ValidationError(
                "Appointment date must be in the future."
            )
    @validates("patient_id")
    def validate_patient_id(self, value):
        if not value:
            raise ValidationError("Patient ID is required.")
    @validates("doctor_id")
    def validate_doctor_id(self, value):
        if not value:
            raise ValidationError("Doctor ID is required.")

appointment_schema = AppointmentSchema()
appointments_schema = AppointmentSchema(many=True)
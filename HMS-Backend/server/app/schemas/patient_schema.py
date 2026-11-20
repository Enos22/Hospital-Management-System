from marshmallow import fields, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.patient import Patient

class PatientSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Patient
        load_instance = True
        include_fk = True

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    age = fields.Int(required=True)
    gender = fields.Str(required=True)
    address = fields.Str(required=True)
    phone_number = fields.Str(required=True)
    email = fields.Email(required=True)
    medical_history = fields.Str()

    @validates("age")
    def validate_age(self, value):
        if value < 0:
            raise ValidationError(
                "Age must be a non-negative integer."
            )
    @validates("gender")
    def validate_gender(self, value):
        if value not in ["male", "female", "other"]:
            raise ValidationError(
                "Gender must be one of: 'male', 'female', or 'other'."
            )
    @validates("email")
    def validate_email(self, value):
        if not value:
            raise ValidationError("Email is required.")
        if "@" not in value or "." not in value:
            raise ValidationError("Invalid email format.")
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields, validate, validates, ValidationError
from app.extensions import db
from app.models.user import User

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        sqla_session = db.session
        load_instance = True
        exclude = ("password_hash",)

    username = fields.String(required=True, validate=validate.Length(min=3))
    role = fields.String(validate=validate.OneOf(["doctor", "patient", "admin"]))
    password = fields.String(required=True, load_only=True, validate=validate.Length(min=8))
    pasword_confirmation =fields.String(required=True,load_only=True)

    @validates("pasword_confirmation")
    def validate_password_confirmation(self, value):
        if self.context.get("data") and value != self.context["data"].get("password"):
            raise ValidationError("Pasword do not match.")

user_schema =UserSchema()
users_schema = UserSchema(many=True)
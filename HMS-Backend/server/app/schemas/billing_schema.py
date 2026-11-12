
from marshmallow import fields, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from app.models.invoice import Invoice
from app.models.payment import Payment


class InvoiceSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Invoice
        load_instance = True
        include_fk = True

    id = fields.Int(dump_only=True)

    patient_id = fields.Int(required=True)
    appointment_id = fields.Int(allow_none=True)

    total_amount = fields.Decimal(
        required=True,
        as_string=True
    )

    status = fields.Str(dump_only=True)

    issued_at = fields.DateTime(dump_only=True)

    @validates("total_amount")
    def validate_total_amount(self, value):
        if value <= 0:
            raise ValidationError(
                "Invoice amount must be greater than zero."
            )


class PaymentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        load_instance = True
        include_fk = True

    id = fields.Int(dump_only=True)

    invoice_id = fields.Int(required=True)

    amount = fields.Decimal(
        required=True,
        as_string=True
    )

    payment_method = fields.Str(required=True)

    transaction_reference = fields.Str(allow_none=True)

    payment_date = fields.DateTime(dump_only=True)

    @validates("amount")
    def validate_amount(self, value):
        if value <= 0:
            raise ValidationError(
                "Payment amount must be greater than zero."
            )

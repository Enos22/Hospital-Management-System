from app.extensions import db

class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=True)
    invoice_number = db.Column(db.String(32), unique=True, nullable=True)
    subtotal = db.Column(db.Float, nullable=False, default=0)
    tax_amount = db.Column(db.Float, nullable=False, default=0)
    discount_amount = db.Column(db.Float, nullable=False, default=0)
    total_amount = db.Column(db.Float, nullable=False)
    amount_paid = db.Column(db.Float, nullable=False, default=0)
    status = db.Column(db.String(20), nullable=False, default='Unpaid')
    issued_at = db.Column(db.DateTime, nullable=True, default=db.func.current_timestamp())
    due_date = db.Column(db.Date, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    patient = db.relationship('Patient', back_populates='invoices', lazy=True)
    appointment = db.relationship('Appointment', back_populates='invoices', lazy=True)
    items = db.relationship('InvoiceItem', back_populates='invoice', cascade='all, delete-orphan', lazy=True)
    payments = db.relationship('Payment', back_populates='invoice', lazy=True)

    def __repr__(self):
        return f'<Invoice {self.id} - Patient {self.patient_id} - Appointment {self.appointment_id}>'
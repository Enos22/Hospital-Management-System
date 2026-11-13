from app.extensions import db

class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Scheduled')

    patient = db.relationship('Patient', back_populates='appointments', lazy=True)
    doctor = db.relationship('Doctor', back_populates='appointments', lazy=True)
    invoices = db.relationship('Invoice', back_populates='appointment', lazy=True)
    def __repr__(self):
        return f'<Appointment {self.id} - Patient {self.patient_id} - Doctor {self.doctor_id}>'
from app.extensions import db
class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    patient = db.relationship('Patient', back_populates='prescriptions', lazy=True)
    doctor = db.relationship('Doctor', back_populates='prescriptions', lazy=True)
    medicine = db.relationship('Medicine', back_populates='prescriptions', lazy=True)

    def __repr__(self):
        return f'<Prescription {self.id} - Patient {self.patient_id} - Doctor {self.doctor_id} - Medicine {self.medicine_id}>'
from app.extensions import db

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    diagnosis = db.Column(db.String(255), nullable=False)
    treatment = db.Column(db.String(255), nullable=False)
    record_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    patient = db.relationship('Patient', back_populates='medical_records', lazy=True)

    def __repr__(self):
        return f'<MedicalRecord {self.id} - Patient {self.patient_id} - Diagnosis {self.diagnosis}>'
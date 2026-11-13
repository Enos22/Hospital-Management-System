from app.extensions import db

class LabRequest(db.Model):
    __tablename__ = 'lab_requests'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    test_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    patient = db.relationship('Patient', back_populates='lab_requests', lazy=True)
    doctor = db.relationship('Doctor', back_populates='lab_requests', lazy=True)

    def __repr__(self):
        return f'<LabRequest {self.id} - Patient {self.patient_id} - Doctor {self.doctor_id}>'
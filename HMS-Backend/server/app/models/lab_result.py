from app.extensions import db
class LabResult(db.Model):
    __tablename__ = 'lab_results'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    test_name = db.Column(db.String(100), nullable=False)
    result_value = db.Column(db.String(100), nullable=False)
    result_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    patient = db.relationship('Patient', back_populates='lab_results', lazy=True)

    def __repr__(self):
        return f'<LabResult {self.id} - Patient {self.patient_id} - Test {self.test_name}>'

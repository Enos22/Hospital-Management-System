from app.extensions import db

class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    speciality_id = db.Column(db.Integer, db.ForeignKey('specialities.id'), nullable=False)
    qualification = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False, unique=True)
    availability_status = db.Column(db.Boolean, nullable=False, default=True)
    license_number = db.Column(db.String(50), nullable=False, unique=True)

    user = db.relationship('User', back_populates='doctor', uselist=False)
    speciality = db.relationship('Speciality', back_populates='doctors', lazy=True)
    appointments = db.relationship('Appointment', back_populates='doctor', lazy=True)
    prescriptions = db.relationship('Prescription', back_populates='doctor', lazy=True)
    lab_requests = db.relationship('LabRequest', back_populates='doctor', lazy=True)
    def __repr__(self):
        return f'<Doctor {self.id} - {self.user.username} - Speciality {self.speciality.name}>'
from utils.extensions import db

class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    speciality_id = db.Column(db.Integer, db.ForeignKey('specialities.id'), nullable=False)
    qualification = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False, unique=True)
    availability_status = db.Column(db.Boolean, nullable=False, default=True)
    license_number = db.Column(db.String(50), nullable=False, unique=True)

    user = db.relationship('User', backref=db.backref('doctor', uselist=False))
    speciality = db.relationship('Speciality', backref=db.backref('doctors', lazy=True))
    prescriptions = db.relationship('Prescription', backref='doctor', lazy=True)
    def __repr__(self):
        return f'<Doctor {self.id} - {self.user.first_name} {self.user.last_name}>'
from app.extensions import db


class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey('users.id'),unique=True,nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.String(200), nullable=True)
    phone_number = db.Column(db.String(15), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime,nullable=False,default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime,nullable=False,default=db.func.current_timestamp(),onupdate=db.func.current_timestamp())
    
    user = db.relationship('User',back_populates='patient')
    appointments = db.relationship('Appointment',back_populates='patient',lazy=True)
    medical_records = db.relationship('MedicalRecord',back_populates='patient',lazy=True)
    prescriptions = db.relationship('Prescription',back_populates='patient',lazy=True )
    lab_requests = db.relationship('LabRequest',back_populates='patient',lazy=True)
    lab_results = db.relationship('LabResult',back_populates='patient',lazy=True)
    invoices = db.relationship('Invoice',back_populates='patient',lazy=True)
    def __repr__(self):
      return f'<Patient {self.id} - Name {self.name}>'
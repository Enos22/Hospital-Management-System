from app.extensions import db


class Speciality(db.Model):
    __tablename__ = 'specialities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)

    doctors = db.relationship('Doctor', back_populates='speciality', lazy=True)

    def __repr__(self):
        return f'<Speciality {self.id} - Name {self.name}>'
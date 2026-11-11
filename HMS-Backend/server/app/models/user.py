from app.extensions import db
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password_hash= db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='patient')
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    doctor = db.relationship('Doctor', back_populates='user', lazy=True)
    patient = db.relationship('Patient', back_populates='user', lazy=True)
    payments = db.relationship('Payment', back_populates='user', lazy=True)
    notifications = db.relationship('Notification', back_populates='user', lazy=True)
    def __repr__(self):
        return f'<User {self.id} - Username {self.username} - Email {self.email}>'
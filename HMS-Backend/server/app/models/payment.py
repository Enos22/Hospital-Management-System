from app.extensions import db
class Payment(db.Model):
     __tablename__ = 'payments'

     id = db.Column(db.Integer, primary_key=True)
     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
     amount = db.Column(db.Float, nullable=False)
     payment_method = db.Column(db.String(50), nullable=False)
     status = db.Column(db.String(20), nullable=False, default='pending')
     created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
     updated_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

     user = db.relationship('User', back_populates='payments', lazy=True)

     def __repr__(self):
         return f'<Payment {self.id} - User {self.user_id} - Amount {self.amount} - Status {self.status}>'
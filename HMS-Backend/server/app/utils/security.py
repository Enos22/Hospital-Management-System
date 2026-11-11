from flask_bcrypt import Bcrypt

bcrypt = Bcrypt

def has_password(password):
    if not password or len(password)< 8:
        raise ValueError("Pasword must be atleast 8 Charcters")
    return bcrypt.generate_password_hash(password).decode('utf-8')

def verify_password(password_hash, password):
    if not password_hash or not password:
        return False
    return bcrypt.check_password_hash(password_hash, password)

@property
def password_hash(self):
    raise AttributeError("Password hash is not readble")

@password_hash.setter
def password_hash(self, password):
    self._password_hash = has_password(password)

def authenticate(self, password):
    return verify_password(self._password_hash, password)

#Handles password hashing, password verification and security-related helper functions.

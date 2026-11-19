from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.extensions import db
from app.models.user import User

def login_required(fn):
    @wraps(fn)

    def wrapper (*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return {"errors": ["Authentication required"]}, 401
        user = db.session.get(User, get_jwt_identity())
        if not user:
            return {"errors": ["Authentication required"]}, 401
        return fn(*args, **kwargs)
    return wrapper

        #Checks user roles and restricts access to authorized resources and operations.

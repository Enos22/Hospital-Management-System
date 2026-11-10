from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(*roles):
    def decorator(fn):
        def wrapper (*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception:
                return {"errors": ["Authentication required"]}, 401
            claims = get_jwt()
            if claims.get("role") not in roles:
                return {"Forbidden": ["You Dont have Permision"]}, 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

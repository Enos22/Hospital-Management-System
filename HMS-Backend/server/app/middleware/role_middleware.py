from functools import wraps
from flask_jwt_extended import get_jwt, jwt_required

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper (*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") not in roles:
                return {"Forbidden": ["You Dont have Permision"]}, 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

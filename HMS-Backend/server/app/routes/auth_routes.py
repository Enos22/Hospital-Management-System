from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.user import User
from schemas.user_schema import user_schema
from functools import wraps

def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorated(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") not in roles:
                return {"errors": ["Forbidden: You don't have permission"]}, 403
            return fn(*args, **kwargs)
        return decorated 
    return wrapper


class Signup(Resource):
    def post(self):
        data = request.get_json(silent =True) or {}
        username = data.get("username")
        password = data.get("password")
        confirmation = data.get("password_confirmation")
        role = data.get("role", "patient") #as dflt

        if not username:
            return {"error": ["Username is required"]}, 422

        if not password:
            return {"error": ["Password is required"]}, 422

        if password != confirmation:
            return {"error": ["You have entered The Wrong password!"]}, 422

        if role not in ["doctor", "patient", "admin"]:
            return {"errors": ["Role Must be Doctor, Patient, or Admin"]}, 422

        #adm chek(only admin to creat admin)
        if role == "admin":
            return {"errors": ["You cannot signup as Admin.Reach out to Super Admin for Assistance"]}, 403

        if User.query.filter_by(username=username).first():
            return {"error": ["Username already Exists"]}, 422

        try:
            user = User(username=username, role=role)
            user.password_hash = password
            db.session.add(user)
            db.session.commit()

            token = create_access_token(
                identity = str(user.id),
                additional_claims = {"role": user.role}
            )
            return {**user_schema.dump(user), "access_token": token},
        
        except(ValueError, Exception) as exc:
            db.session.rollback()
            return {"errors": [str(exc)]}, 422


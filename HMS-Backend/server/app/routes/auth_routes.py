from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import user_schema
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
        data = request.get_json(silent=True) or {}
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        confirmation = data.get("password_confirmation")
        role = data.get("role", "patient")

        if not username:
            return {"error": ["Username is required"]}, 422

        if not email:
            return {"error": ["Email is required"]}, 422

        if not password:
            return {"error": ["Password is required"]}, 422

        if password != confirmation:
            return {"error": ["You have entered The Wrong password!"]}, 422

        if role not in ["doctor", "patient", "admin"]:
            return {"errors": ["Role Must be Doctor, Patient, or Admin"]}, 422

        if role == "admin":
            return {"errors": ["You cannot signup as Admin.Reach out to Super Admin for Assistance"]}, 403

        if User.query.filter_by(username=username).first():
            return {"error": ["Username already Exists"]}, 422

        if User.query.filter_by(email=email).first():
            return {"error": ["Email already Exists"]}, 422

        try:
            user = User(username=username, email=email, role=role)
            user.password = password
            db.session.add(user)
            db.session.commit()

            token = create_access_token(
                identity=str(user.id),
                additional_claims={"role": user.role}
            )
            return {**user_schema.dump(user), "access_token": token}, 201

        except (ValueError, Exception) as exc:
            db.session.rollback()
            return {"errors": [str(exc)]}, 422

class Login(Resource):
    def post(self):
        data = request.get_json(silent =True) or {}
        user = User.query.filter_by(username=data.get("username")).first()
        password = data.get("password")

        if user and password and  user.authenticated(password):
            token = create_access_token(
                identity = str(user.id),
                additional_claims = {"role": user.role}
            )
            return {**user_schema.dump(user), "access_token": token}, 200
        return {"errors": ["Invalid Username or Password"]}, 401

class Logout(Resource):
    def delete(self):
        # front delets jwt token 
        return {}, 204

class Checksession(Resource):
    @jwt_required()
    def get(self):
        user = db.session.get(User, get_jwt_identity())
        if user is None:
            return {"errors": ["Authentication required"]}, 401
        return user_schema.dump(user), 200
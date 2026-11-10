from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from schemas.user_schema import user_schema

class Signup(Resource):
    def post(self):
        data = request.get_json(silent =True) or {}
        username = data.get("username")
        password = data.get("password")
        confirmation = data.get("password_confirmation")

        if not username:
            return {"error": ["Username is required"]}, 422

        if not password:
            return {"error": ["Password is required"]}, 422

        if password != confirmation:
            return {"error": ["You have entered The Wrong password!"]}, 422

        if User.query.filter_by(username=username).first():
            return {"error": ["Username already Exists"]}, 422

        try:
            user = User(username=username)
            user.password_hash = password
            db.session.add(user)
            db.session.commit()

            token = create_access_token(identity=user.id)
            return {**user_schema.dump(user), "access_token": token},

        except(ValueError, Exception) as exc:
            db.session.rollback()
            return {"errors": [str(exc)]}, 422
            
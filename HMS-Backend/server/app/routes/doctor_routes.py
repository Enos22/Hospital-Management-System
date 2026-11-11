#Implements doctor CRUD operations, including registration, retrieval, updating and
#deletion of doctor profiles.

from flask import request
from flask_restful import Resource
from extensions import db
from models.user import User
from schemas.user_schema import user_schema, users_schema
from middleware.role_middleware import role_required

class DoctorList(Resource):
    @role_required("admin", "doctor", "patient")
    def get(self):
        return users_schema.dump(User.query.filter_by(role="doctor").all()), 200

    @role_required("admin")
    def post(self):
        data = request.get_json(silent=True) or {}

        if User.query.filter_by(username=data.get("username")).first():
            return {"errors": ["Username Exists"]}, 422
        try:
            user = User(username=data.get("username"), role = "doctor")
            user.password_hash = data.get("password", "doctor123")
            db.session.add(user)
            db.session.commit()

            return user_schema.dump(user), 201
        except Exception as e:
            db.session.rollback()
            return {"errors": [str(e)]}, 422

class DoctorDetail(Resource):
    @role_required("admin", "doctor", "patient")
    def get(self, id):
        user = db.session.get(User, id)
        if not user or user.role != "doctor":
            return {"errors": ["Doctor not found"]}, 404
        return user_schema.dump(user), 200

    @role_required("admin", "patient")
    def patch(self, id):
        user = db.session.get(user, id)

        if not user or user.role != "doctor":
            return {"errors": ["Doctor not Found"]}, 404
        data = request.get_json(silent=True) or {}

        if "username" in data:
            username = data["username"]
            db.session.commit()
            return user_schema.dump(user), 200
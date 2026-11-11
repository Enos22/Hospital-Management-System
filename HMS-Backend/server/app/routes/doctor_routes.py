from flask import Request
from flask_restful import Resource
from extensions import db
from models.user import User
from schemas.user_schema import user_schema, users_schema
from middleware.role_middleware import role_required

class DoctorList(Resource):
    @role_required("admin", "doctor", "patient")
    def get(self):
        return users_schema.dump(User.query.filter_by(role="doctor").all()), 200
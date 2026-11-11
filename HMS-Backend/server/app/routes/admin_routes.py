from flask_restful import Resource
from extensions import db
from sqlalchemy import func
from models.user import User
from schemas.user_schema import user_schema, users_schema
from middleware.role_middleware import role_required

class AdminDashboard(Resource):
    @role_required("admin")
    def get(self):
        role_counts = dict(
            db.session.query(User.role, func.count(User.id))
            .group_by(User.role)
            .all()
        )
        return {
            "total_users": sum(role_counts.values()),
            "total_patients": role_counts.get("patient", 0),
            "total_doctors": role_counts.get("doctor", 0),
            "total_admins": role_counts.get("admin", 0),
        }, 200
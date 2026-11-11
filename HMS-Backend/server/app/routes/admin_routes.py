from flask import request
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
    
class AdminUserList(Resource):
    @role_required("admin")
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per-page",20, type=int), 100)
        role = request.args.get("role", type=str)
        
        query = User.query

        if role:
            query = query.filter_by(role=role)
            pagination = query.order_by(User.id.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
        return {
            "users": users_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            'pages': pagination.pages,
            "per_page": pagination.per_page,
        }, 200
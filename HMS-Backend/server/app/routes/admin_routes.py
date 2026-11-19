from flask import request
from flask_restful import Resource
from app.extensions import db
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User
from app.schemas.user_schema import user_schema, users_schema
from app.middleware.role_middleware import role_required
from flask_jwt_extended import get_jwt_identity

AVAILABLE_ROLES = {"doctor", "patient", "admin", "billing"}

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
        page = max(request.args.get("page", 1, type=int), 1)
        per_page = min(max(request.args.get("per_page", 20, type=int), 1), 100)
        role = request.args.get("role", type=str)

        if role and role not in AVAILABLE_ROLES:
            return {"errors": ["Invalid role filter"]}, 400

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

class AdminUserDetail(Resource):
    @role_required("admin")
    def patch(self, id):

        user =db.session.get(User, id)

        if not  user:
            return {"errors": ["User not Found"]}, 404
        
        data = request.get_json(silent=True) or {}
        new_role = data.get("role")

        if new_role not in AVAILABLE_ROLES:
            return {
                "errors": [f"Invalid Role! Must be one of: {','.join(sorted(AVAILABLE_ROLES))}"]
            }, 400

        current_user_id = get_jwt_identity()

        if str(user.id) == str(current_user_id) and new_role != "admin":
            return {"errors": ["You cannot change your own admin role"]}, 403
        try:
             user.role = data["role"]
             db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            return {"errors": ["Database error while updating the user"]}, 500           
            
        return user_schema.dump(user), 200

    @role_required("admin")
    def delete(self, id: int):
        user = db.session.get(User, id)

        if not user:
            return {"errors": ["User Not Found"]}, 404

        current_user_id = get_jwt_identity()
        if str(user.id) == str(current_user_id):
            return {"errors":["You cannot delete your own account"]}, 403

        try:
            db.session.delete(user)
            db.session.commit()

        except SQLAlchemyError:
            db.session.rollback()
           
            return {"errors":["Database error deleting user"]}, 500

        return {}, 204
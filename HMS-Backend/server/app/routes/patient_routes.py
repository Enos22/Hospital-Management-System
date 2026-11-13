from flask import request
from flask_restful import Resource
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import user_schema, users_schema
from app.middleware.role_middleware import role_required
from sqlalchemy import or_

class PatientList(Resource):
    @role_required("doctor", "admin")
    def get(self):
        #filta frm url-query and exract pagination
        page =request.args.get('page', default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)
        search_query = request.args.get('search', default=None, type=str)

        query = User.query.filter_by(role="patient")

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    User.username.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )
        query = query.order_by(User.created_at.desc())

        paginated_patients = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "patients": users_schema.dump(paginated_patients.items),
            "metadata": {
                "total_items": paginated_patients.total,
                "total_pages": paginated_patients.pages,
                "current_page": paginated_patients.page,
                "per_page": paginated_patients.per_page,
                "has_next": paginated_patients.has_next,
                "has_prev": paginated_patients.has_prev
            }
        }, 200
    @role_required("admin")
    def post(self):
        data = request.get_json(silent=True) or {}
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        if not username or not email or not password:
            return {"errors": ["Username, email, and password are required"]}, 422
        
        if User.query.filter_by(username= username, role="patient").first():
            return {"errors": ["Username exists"]}, 422
        if User.query.filter_by(email=email).first():
            return {"errors": ["Email exists"]}, 422
        try:
            user = User(username=username, email=email, role="patient")
            user.password = password
            db.session.add(user)
            db.session.commit()

            return user_schema.dump(user), 201
        except Exception as e:
            db.session.rollback()
            return {"errors": [str(e)]}, 422

class PatientDetail(Resource):
    @jwt_required()
    def get(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "patient":
            return {"errors": ["Patient Not Found"]}, 404
        role = get_jwt().get("role")
        if role not in {"doctor", "admin", "patient"}:
            return {"errors": ["You are not allowed to view this patient"]}, 403
        if role == "patient" and str(user.id) != str(get_jwt_identity()):
            return {"errors": ["You are not allowed to view this patient"]}, 403
        return user_schema.dump(user), 200
    
    @jwt_required()
    def patch(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "patient":
            return {"errors": ["Patient Not Found"]}, 404
        role = get_jwt().get("role")
        if role != "admin" and not (
            role == "patient" and str(user.id) == str(get_jwt_identity())
        ):
            return {"errors": ["You are not allowed to update this patient"]}, 403
        
        data = request.get_json(silent=True) or {}
        if not data:
            return {"errors": ["No update data provided"]}, 400
        try:
            if "username" in data:
                user.username = data["username"]

            if "password" in data:
                user.password = data["password"]

            if "email" in data:
                user.email = data["email"]
            db.session.commit()
            return user_schema.dump(user), 200
        except Exception as e:
            return {"errors": [str(e)]}, 422

    @role_required("admin")
    def delete(self, id):
        user = db.session.get(User, id)

        if not user or user.role != "patient":
            return {"errors": ["Patient Not FoUnd"]}, 404
        try:
            db.session.delete(user)
            db.session.commit()
            return {}, 204
        except Exception as e:
            db.session.rollback()
            return {"errors": [str(e)]}, 422

        # implement patient deletion via DELETE endpoint
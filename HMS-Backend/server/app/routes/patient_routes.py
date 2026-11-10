from flask import request
from flask_restful import Resource
from extensions import db
from models.user import User
from schemas.user_schema import user_schema, users_schema
from middleware.role_middleware import role_required
from sqlalchemy import or_

class PatientList(Resource):
    @role_required("doctor", "admin")
    def get(self):
        #filta frm url-query and exract pagination
        page =request.args.get('page', default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)
        search_query = request.args.get('search', default=None, type=str)
        status_filter = request.args.get("status", default=None, type=str)

        query = User.query.filter_by(role="patient")

        if search_query:
            search_pattern = f"%{search_query}"
            query = query.filter(
                or_(
                    User.first_name.ilike(search_pattern),
                    User.last_name.ilike(search_pattern),
                    User.email.ilike(search_pattern)                
                )
            )
        if status_filter:
            query = query.filter(User.status == status_filter)
        query = query.order_by(User.created_at.desc())

        paginated_patients = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "metadata": {
                "total_items": paginated_patients.total,
                "total_pages": paginated_patients.pages,
                "current_page": paginated_patients.page,
                "per_page": paginated_patients.per_page,
                "has_next": paginated_patients.has_next,
                "has_prev": paginated_patients.has_prev
            }
        }, 200
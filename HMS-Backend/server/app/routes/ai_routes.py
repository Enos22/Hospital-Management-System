from flask import request
from flask_restful import Resource

from app.middleware.role_middleware import role_required
from app.services.ai_faq_service import (
    AIProviderError,
    AIProviderNotConfigured,
    answer_faq_question,
)


class PatientFAQ(Resource):
    @role_required("patient")
    def post(self):
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return {"errors": ["A JSON object is required"]}, 400

        question = data.get("question")
        if not isinstance(question, str) or not question.strip():
            return {"errors": ["Question is required"]}, 422
        question = question.strip()
        if len(question) > 500:
            return {"errors": ["Question must be 500 characters or fewer"]}, 422

        try:
            answer = answer_faq_question(question)
        except AIProviderNotConfigured:
            return {"errors": ["The FAQ assistant is not configured"]}, 503
        except AIProviderError:
            return {"errors": ["The FAQ assistant is temporarily unavailable"]}, 502

        return {"answer": answer}, 200

from app.extensions import db
from app.models.lab_request import LabRequest
from app.models.lab_result import LabResult


class LaboratoryTestService:
    @staticmethod
    def get_all_tests(patient_id=None, status=None, page=1, per_page=10):
        query = LabRequest.query
        if patient_id is not None:
            query = query.filter_by(patient_id=patient_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(LabRequest.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

    @staticmethod
    def get_test_by_id(test_id):
        return db.session.get(LabRequest, test_id)

    @staticmethod
    def get_result(test):
        result = (
            LabResult.query.filter_by(
                patient_id=test.patient_id, test_name=test.test_type
            )
            .order_by(LabResult.result_date.desc())
            .first()
        )
        return result.result_value if result else None

    @staticmethod
    def create_test(data):
        test = LabRequest(
            patient_id=int(data["patient_id"]),
            doctor_id=int(data["doctor_id"]),
            test_type=data["test_name"],
        )
        db.session.add(test)
        db.session.commit()
        return test

    @staticmethod
    def update_test(test, data):
        if "status" in data:
            status = data["status"]
            if status not in {"Pending", "In Progress", "Completed", "Cancelled"}:
                raise ValueError("Invalid laboratory test status")
            test.status = status
        if "result" in data:
            result_value = data["result"]
            if not isinstance(result_value, str) or not result_value.strip():
                raise ValueError("Result must be a non-empty string")
            result = LabResult(
                patient_id=test.patient_id,
                test_name=test.test_type,
                result_value=result_value.strip(),
            )
            db.session.add(result)
            test.status = "Completed"
        db.session.commit()
        return test

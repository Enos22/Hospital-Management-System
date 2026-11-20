from extensions import db
from models.medical_record import MedicalRecord


class RecordService:
    """Handles database operations and business logic for patient medical records."""

    @staticmethod
    def get_all_records(patient_id=None, search=None, page=1, per_page=10):
        """Fetch a paginated list of medical records, with optional filtering by patient ID or diagnosis search term."""
        query = MedicalRecord.query

        # Filter by a specific patient if requested
        if patient_id:
            query = query.filter_by(patient_id=patient_id)

        # Perform a case-insensitive search on the diagnosis field if a query is provided
        if search:
            query = query.filter(
                MedicalRecord.diagnosis.ilike(f"%{search}%")
            )

        # Return the paginated results ordered by newest first
        return query.order_by(
            MedicalRecord.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

    @staticmethod
    def get_record_by_id(record_id):
        """Retrieve a single medical record using its unique ID."""
        return db.session.get(MedicalRecord, record_id)

    @staticmethod
    def create_record(data):
        """Instantiate, save, and return a new medical record from the provided data dictionary."""
        record = MedicalRecord(**data)

        db.session.add(record)
        db.session.commit()

        return record

    @staticmethod
    def update_record(record, data):
        """Update only the provided fields on an existing medical record and save changes."""
        for field, value in data.items():
            setattr(record, field, value)

        db.session.commit()

        return record

    @staticmethod
    def delete_record(record):
        """Remove a medical record from the database entirely."""
        db.session.delete(record)
        db.session.commit()

        return True

    @staticmethod
    def get_patient_history(patient_id):
        """Retrieve the complete medical history for a given patient, ordered from newest to oldest."""
        return MedicalRecord.query.filter_by(
            patient_id=patient_id
        ).order_by(
            MedicalRecord.created_at.desc()
        ).all()
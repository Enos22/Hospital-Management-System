from app.extensions import db
from app.models.prescription import Prescription


class PrescriptionService:
    """Handles database operations and business logic for patient prescriptions."""

    @staticmethod
    def get_all_prescriptions(patient_id=None, doctor_id=None, page=1, per_page=10):
        """Fetch a paginated list of prescriptions, with optional filters for patient ID or doctor ID."""
        query = Prescription.query

        # Filter by a specific patient if requested
        if patient_id:
            query = query.filter_by(patient_id=patient_id)

        # Filter by a specific prescribing doctor if requested
        if doctor_id:
            query = query.filter_by(doctor_id=doctor_id)

        # Return the paginated results ordered by newest first
        return query.order_by(
            Prescription.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

    @staticmethod
    def get_prescription_by_id(prescription_id):
        """Retrieve a single prescription using its unique ID."""
        return db.session.get(Prescription, prescription_id)

    @staticmethod
    def create_prescription(data):
        """Instantiate, save, and return a new prescription from the provided data dictionary."""
        prescription = Prescription(**data)

        db.session.add(prescription)
        db.session.commit()

        return prescription

    @staticmethod
    def update_prescription(prescription, data):
        """Update only the provided fields on an existing prescription and save changes."""
        for field, value in data.items():
            setattr(prescription, field, value)

        db.session.commit()

        return prescription

    @staticmethod
    def delete_prescription(prescription):
        """Remove a prescription record from the database entirely."""
        db.session.delete(prescription)
        db.session.commit()

        return True
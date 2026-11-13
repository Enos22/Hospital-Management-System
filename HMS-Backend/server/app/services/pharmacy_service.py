from app.extensions import db
from app.models.medicine import Medicine


class PharmacyService:
    @staticmethod
    def get_all_medicines(search=None, page=1, per_page=10):
        query = Medicine.query
        if search:
            query = query.filter(Medicine.name.ilike(f"%{search}%"))
        return query.order_by(Medicine.name).paginate(
            page=page, per_page=per_page, error_out=False
        )

    @staticmethod
    def get_medicine_by_id(medicine_id):
        return db.session.get(Medicine, medicine_id)

    @staticmethod
    def create_medicine(data):
        medicine = Medicine(**data)
        db.session.add(medicine)
        db.session.commit()
        return medicine

    @staticmethod
    def update_medicine(medicine, data):
        for field, value in data.items():
            setattr(medicine, field, value)
        db.session.commit()
        return medicine

    @staticmethod
    def delete_medicine(medicine):
        db.session.delete(medicine)
        db.session.commit()

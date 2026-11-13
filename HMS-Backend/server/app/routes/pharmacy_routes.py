from flask import request
from flask_restful import Resource

from app.services.pharmacy_service import PharmacyService
from app.middleware.role_middleware import role_required


class MedicineList(Resource):
    """Handles listing all pharmacy medicines (with optional search and pagination) and adding new medicines."""

    @role_required("doctor", "admin")
    def get(self):
        """Fetch a paginated list of medicines, optionally filtered by a search keyword."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        search = request.args.get("search", type=str)

        # Retrieve medicines through the service layer
        paginated = PharmacyService.get_all_medicines(
            search=search,
            page=page,
            per_page=per_page
        )

        return {
            "medicines": [
                {
                    "id": medicine.id,
                    "name": medicine.name,
                    "description": medicine.description,
                    "price": medicine.price,
                    "stock_quantity": medicine.stock_quantity,
                    "created_at": (
                        medicine.created_at.isoformat()
                        if medicine.created_at else None
                    ),
                    "updated_at": (
                        medicine.updated_at.isoformat()
                        if medicine.updated_at else None
                    )
                }
                for medicine in paginated.items
            ],
            "metadata": {
                "total_items": paginated.total,
                "total_pages": paginated.pages,
                "current_page": paginated.page,
                "per_page": paginated.per_page,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev
            }
        }, 200

    @role_required("admin")
    def post(self):
        """Validate incoming data and add a new medicine to the pharmacy inventory (Admin only)."""
        data = request.get_json()

        if not data:
            return {"message": "Please provide medicine details"}, 400

        # Ensure all mandatory fields are present and non-empty
        required_fields = ["name", "price", "stock_quantity"]

        missing_fields = [
            field for field in required_fields
            if data.get(field) is None or data.get(field) == ""
        ]

        if missing_fields:
            return {
                "message": "Some required fields are missing",
                "missing_fields": missing_fields
            }, 400

        # Validate numeric types for price and stock quantity
        try:
            price = float(data["price"])
            stock_quantity = int(data["stock_quantity"])
        except (ValueError, TypeError):
            return {
                "message": "Price must be numeric and stock quantity must be an integer"
            }, 400

        # Ensure financial and stock values cannot be negative
        if price < 0 or stock_quantity < 0:
            return {
                "message": "Price and stock quantity cannot be negative"
            }, 400

        medicine_data = {
            "name": data["name"],
            "description": data.get("description"),
            "price": price,
            "stock_quantity": stock_quantity
        }

        # Save the new medicine using the service layer
        medicine = PharmacyService.create_medicine(medicine_data)

        return {
            "message": "Medicine added successfully",
            "medicine": {
                "id": medicine.id,
                "name": medicine.name,
                "description": medicine.description,
                "price": medicine.price,
                "stock_quantity": medicine.stock_quantity
            }
        }, 201


class MedicineDetail(Resource):
    """Handles retrieving, updating, and deleting an individual medicine record by its ID."""

    @role_required("doctor", "admin")
    def get(self, medicine_id):
        """Fetch a specific medicine using its unique ID."""
        medicine = PharmacyService.get_medicine_by_id(medicine_id)

        if not medicine:
            return {"message": "Medicine not found"}, 404

        return {
            "medicine": {
                "id": medicine.id,
                "name": medicine.name,
                "description": medicine.description,
                "price": medicine.price,
                "stock_quantity": medicine.stock_quantity
            }
        }, 200

    @role_required("admin")
    def patch(self, medicine_id):
        """Update specific allowed details or stock levels for an existing medicine (Admin only)."""
        medicine = PharmacyService.get_medicine_by_id(medicine_id)

        if not medicine:
            return {"message": "Medicine not found"}, 404

        data = request.get_json()

        if not data:
            return {"message": "Please provide details to update"}, 400

        # Restrict updates only to safe, allowed fields
        allowed_fields = {
            "name",
            "description",
            "price",
            "stock_quantity"
        }

        update_data = {
            field: value
            for field, value in data.items()
            if field in allowed_fields
        }

        if not update_data:
            return {"message": "No valid update fields provided"}, 400

        # Validate price if included in the update payload
        if "price" in update_data:
            try:
                update_data["price"] = float(update_data["price"])
            except (ValueError, TypeError):
                return {"message": "Price must be numeric"}, 400

            if update_data["price"] < 0:
                return {"message": "Price cannot be negative"}, 400

        # Validate stock quantity if included in the update payload
        if "stock_quantity" in update_data:
            try:
                update_data["stock_quantity"] = int(
                    update_data["stock_quantity"]
                )
            except (ValueError, TypeError):
                return {"message": "Stock quantity must be an integer"}, 400

            if update_data["stock_quantity"] < 0:
                return {"message": "Stock quantity cannot be negative"}, 400

        # Apply updates via the service layer
        medicine = PharmacyService.update_medicine(
            medicine, update_data
        )

        return {
            "message": "Medicine updated successfully",
            "medicine": {
                "id": medicine.id,
                "name": medicine.name,
                "description": medicine.description,
                "price": medicine.price,
                "stock_quantity": medicine.stock_quantity
            }
        }, 200

    @role_required("admin")
    def delete(self, medicine_id):
        """Delete an existing medicine from the pharmacy inventory (Admin only)."""
        medicine = PharmacyService.get_medicine_by_id(medicine_id)

        if not medicine:
            return {"message": "Medicine not found"}, 404

        PharmacyService.delete_medicine(medicine)

        return {"message": "Medicine deleted successfully"}, 200
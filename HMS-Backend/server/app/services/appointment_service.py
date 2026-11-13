from datetime import datetime
from app.shared.extensions import db
from app.nnmodels.appointment import Appointment
from app.benson.models.patient import Patient
from app.benson.models.doctor import Doctor
from app.antony.services.scheduling_service import SchedulingService
from app.antony.utils.conflict_checker import check_appointment_conflict

class AppointmentService:
    @staticmethod
    def create_appointment(data: dict) -> dict:
        """
        Creates a new appointment after validating entities, working hours,
        and ensuring no double-booking conflicts exist for doctor or patient.
        """
        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        appointment_date = data.get("date")
        start_time = data.get("start_time")
        reason = data.get("reason", "")
        duration = data.get("duration_minutes", 30)

        # 1. Verify Patient and Doctor exist
        patient = Patient.query.get(patient_id)
        if not patient:
            return {"success": False, "message": "Patient not found.", "status_code": 404}

        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return {"success": False, "message": "Doctor not found.", "status_code": 404}

        # 2. Check if slot falls within doctor's working hours
        schedule_info = SchedulingService.get_doctor_working_hours(doctor_id, appointment_date)
        if not schedule_info.get("is_working_day"):
            return {
                "success": False, 
                "message": schedule_info.get("message", "Doctor is unavailable on this date."), 
                "status_code": 400
            }

        if not SchedulingService.validate_slot_within_working_hours(appointment_date, start_time, duration):
            return {
                "success": False,
                "message": "Requested appointment time is outside of doctor's working hours.",
                "status_code": 400
            }

        # 3. Check for double-booking conflicts (Doctor & Patient)
        conflict_result = check_appointment_conflict(
            doctor_id=doctor_id,
            patient_id=patient_id,
            appointment_date=appointment_date,
            start_time=start_time,
            duration_minutes=duration
        )
        if conflict_result["has_conflict"]:
            return {"success": False, "message": conflict_result["message"], "status_code": 409}

        # 4. Create and persist appointment
        try:
            new_appointment = Appointment(
                patient_id=patient_id,
                doctor_id=doctor_id,
                date=appointment_date,
                start_time=start_time,
                reason=reason,
                status="scheduled"
            )
            db.session.add(new_appointment)
            db.session.commit()

            return {
                "success": True,
                "message": "Appointment booked successfully.",
                "data": new_appointment,
                "status_code": 201
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Database error: {str(e)}", "status_code": 500}

    @staticmethod
    def get_all_appointments(filters: dict = None) -> list:
        """
        Retrieves appointments, optionally filtered by doctor_id, patient_id, date, or status.
        """
        query = Appointment.query

        if filters:
            if filters.get("doctor_id"):
                query = query.filter_by(doctor_id=filters["doctor_id"])
            if filters.get("patient_id"):
                query = query.filter_by(patient_id=filters["patient_id"])
            if filters.get("date"):
                query = query.filter_by(date=filters["date"])
            if filters.get("status"):
                query = query.filter_by(status=filters["status"])

        return query.order_by(Appointment.date.asc(), Appointment.start_time.asc()).all()

    @staticmethod
    def get_appointment_by_id(appointment_id: int):
        """
        Fetches a single appointment by its ID.
        """
        return Appointment.query.get(appointment_id)

    @staticmethod
    def reschedule_appointment(appointment_id: int, new_date: str, new_start_time: str, duration: int = 30) -> dict:
        """
        Reschedules an existing appointment to a new date/time after running conflict and schedule checks.
        """
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return {"success": False, "message": "Appointment not found.", "status_code": 404}

        if appointment.status in ["cancelled", "completed"]:
            return {
                "success": False, 
                "message": f"Cannot reschedule an appointment that is already {appointment.status}.", 
                "status_code": 400
            }

        # Validate new working hours
        schedule_info = SchedulingService.get_doctor_working_hours(appointment.doctor_id, new_date)
        if not schedule_info.get("is_working_day"):
            return {"success": False, "message": schedule_info.get("message"), "status_code": 400}

        if not SchedulingService.validate_slot_within_working_hours(new_date, new_start_time, duration):
            return {
                "success": False, 
                "message": "New appointment time is outside working hours.", 
                "status_code": 400
            }

        # Check conflicts while excluding the current appointment ID
        conflict_result = check_appointment_conflict(
            doctor_id=appointment.doctor_id,
            patient_id=appointment.patient_id,
            appointment_date=new_date,
            start_time=new_start_time,
            duration_minutes=duration,
            exclude_appointment_id=appointment.id
        )
        if conflict_result["has_conflict"]:
            return {"success": False, "message": conflict_result["message"], "status_code": 409}

        try:
            appointment.date = new_date
            appointment.start_time = new_start_time
            appointment.status = "rescheduled"
            db.session.commit()

            return {
                "success": True,
                "message": "Appointment rescheduled successfully.",
                "data": appointment,
                "status_code": 200
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Database error: {str(e)}", "status_code": 500}

    @staticmethod
    def update_appointment_details(appointment_id: int, data: dict) -> dict:
        """
        Updates general appointment fields (such as reason or status like 'completed').
        For date/time changes, directs to reschedule_appointment.
        """
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return {"success": False, "message": "Appointment not found.", "status_code": 404}

        # If date or time is being changed, delegate to reschedule logic
        if "date" in data or "start_time" in data:
            target_date = data.get("date", appointment.date)
            target_time = data.get("start_time", appointment.start_time)
            reschedule_res = AppointmentService.reschedule_appointment(appointment_id, target_date, target_time)
            if not reschedule_res["success"]:
                return reschedule_res

        if "reason" in data:
            appointment.reason = data["reason"]
        if "status" in data and data["status"] != "cancelled":
            appointment.status = data["status"]

        try:
            db.session.commit()
            return {
                "success": True,
                "message": "Appointment updated successfully.",
                "data": appointment,
                "status_code": 200
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Database error: {str(e)}", "status_code": 500}

    @staticmethod
    def cancel_appointment(appointment_id: int) -> dict:
        """
        Cancels an active appointment, freeing up the time slot for future bookings.
        """
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return {"success": False, "message": "Appointment not found.", "status_code": 404}

        if appointment.status == "cancelled":
            return {"success": False, "message": "Appointment is already cancelled.", "status_code": 400}

        try:
            appointment.status = "cancelled"
            db.session.commit()
            return {
                "success": True,
                "message": "Appointment cancelled successfully.",
                "data": appointment,
                "status_code": 200
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Database error: {str(e)}", "status_code": 500}
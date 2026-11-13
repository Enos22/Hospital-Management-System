from datetime import datetime, time, timedelta

from app.models.appointment import Appointment
from app.models.doctor import Doctor

class SchedulingService:
    @staticmethod
    def get_doctor_working_hours(doctor_id: int, target_date: str) -> dict:
        """
        Defines standard working hours for a doctor on a given day.
        Can be extended to check database records if a doctor-specific schedule model exists.
        """
        # Standard default hospital working hours: 09:00 to 17:00 (9 AM - 5 PM)
        # Weekend logic can be added here if doctors are off on Sat/Sun
        try:
            day_of_week = datetime.strptime(target_date, "%Y-%m-%d").weekday()
            # 5 = Saturday, 6 = Sunday
            if day_of_week >= 5:
                return {
                    "is_working_day": False,
                    "start_time": None,
                    "end_time": None,
                    "message": "Doctor is not scheduled to work on weekends."
                }
        except ValueError:
            return {"is_working_day": False, "message": "Invalid date format. Use YYYY-MM-DD."}

        return {
            "is_working_day": True,
            "start_time": time(9, 0),   # 09:00 AM
            "end_time": time(17, 0),    # 05:00 PM
            "slot_duration_minutes": 30
        }

    @staticmethod
    def get_available_time_slots(doctor_id: int, target_date: str) -> dict:
        """
        Generates available appointment time slots for a doctor on a specific date,
        filtering out times that are already booked.
        """
        # 1. Verify doctor exists
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return {"success": False, "message": "Doctor not found.", "slots": []}

        # 2. Check working hours
        schedule = SchedulingService.get_doctor_working_hours(doctor_id, target_date)
        if not schedule["is_working_day"]:
            return {"success": True, "message": schedule["message"], "slots": []}

        work_start = schedule["start_time"]
        work_end = schedule["end_time"]
        slot_duration = timedelta(minutes=schedule["slot_duration_minutes"])

        # 3. Fetch existing active appointments for this doctor on this date
        booked_appointments = Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == datetime.strptime(target_date, "%Y-%m-%d").date(),
            Appointment.status != 'cancelled'
        ).all()

        # Extract booked start times as string representations (e.g., "09:30")
        booked_times = {appt.start_time for appt in booked_appointments}

        # 4. Generate all potential slots and filter out booked ones
        available_slots = []
        current_dt = datetime.combine(datetime.strptime(target_date, "%Y-%m-%d").date(), work_start)
        end_dt = datetime.combine(datetime.strptime(target_date, "%Y-%m-%d").date(), work_end)

        while current_dt + slot_duration <= end_dt:
            slot_str = current_dt.strftime("%H:%M")
            
            if slot_str not in booked_times:
                available_slots.append(slot_str)
                
            current_dt += slot_duration

        return {
            "success": True,
            "doctor_id": doctor_id,
            "date": target_date,
            "available_slots": available_slots
        }

    @staticmethod
    def validate_slot_within_working_hours(target_date: str, start_time: str, duration_minutes: int = 30) -> bool:
        """
        Ensures a requested appointment slot falls strictly within allowed working hours.
        """
        try:
            req_start = datetime.strptime(start_time, "%H:%M").time()
            req_start_dt = datetime.combine(datetime.strptime(target_date, "%Y-%m-%d").date(), req_start)
            req_end_dt = req_start_dt + timedelta(minutes=duration_minutes)
            
            # Use general hours or query doctor profile
            work_start = time(9, 0)
            work_end = time(17, 0)
            
            day_start_dt = datetime.combine(req_start_dt.date(), work_start)
            day_end_dt = datetime.combine(req_start_dt.date(), work_end)

            return day_start_dt <= req_start_dt and req_end_dt <= day_end_dt
        except ValueError:
            return False
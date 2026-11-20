"""Role-based interactive CLI for the AfyaCare Flask backend.

Run from HMS-Backend/server with `python cli.py`. This uses Flask's in-process
test client, so the HTTP server does not need to be started separately.
"""

import json
from dataclasses import dataclass
from datetime import datetime
from getpass import getpass
from pprint import pprint

from app import create_app
from app.models.doctor import Doctor
from app.models.patient import Patient


@dataclass(frozen=True)
class Action:
    label: str
    method: str
    path: str
    body_hint: str = ""
    query: str = ""
    confirm: str = ""
    special: str = ""


def a(label, method, path, body_hint="", query="", confirm="", special=""):
    return Action(label, method, path, body_hint, query, confirm, special)


# These menus follow the routes currently registered in app/__init__.py.
# The backend remains the source of truth for access control.
MENUS = {
    "admin": [
        ("Users", [
            a("List users", "GET", "/api/admin/users", query="role"),
            a("Change a user's role", "PATCH", "/api/admin/users/{id}", '{"role":"doctor"}'),
            a("Delete a user", "DELETE", "/api/admin/users/{id}", confirm="DELETE"),
        ]),
        ("Patients", [
            a("List/search patients", "GET", "/api/patients", query="patient_search"),
            a("Add patient account", "POST", "/api/patients", '{"username":"...","email":"...","password":"..."}'),
            a("View patient", "GET", "/api/patients/{id}"),
            a("Update patient account", "PATCH", "/api/patients/{id}", '{"username":"..."}'),
            a("Delete patient account", "DELETE", "/api/patients/{id}", confirm="DELETE"),
        ]),
        ("Doctors", [
            a("List doctors", "GET", "/api/doctors"),
            a("Add doctor", "POST", "/api/doctors", '{"username":"...","speciality_id":1,"password":"..."}'),
            a("View doctor", "GET", "/api/doctors/{id}"),
            a("Update doctor", "PATCH", "/api/doctors/{id}", '{"username":"...","email":"..."}'),
            a("Delete doctor", "DELETE", "/api/doctors/{id}", confirm="DELETE"),
        ]),
        ("Appointments", [
            a("List appointments", "GET", "/api/appointments", query="date"),
            a("Book appointment", "POST", "/api/appointments", special="book"),
            a("View appointment", "GET", "/api/appointments/{id}"),
            a("Update appointment", "PUT", "/api/appointments/{id}", '{"appointment_date":"YYYY-MM-DD","appointment_time":"HH:MM","status":"scheduled"}'),
            a("Cancel appointment", "PATCH", "/api/appointments/{id}/cancel", confirm="CANCEL"),
        ]),
        ("Medical records", [
            a("List records", "GET", "/api/medical-records"),
            a("Add record", "POST", "/api/medical-records", '{"patient_id":1,"diagnosis":"...","treatment":"..."}'),
            a("View record", "GET", "/api/medical-records/{id}"),
            a("Update record", "PATCH", "/api/medical-records/{id}", '{"diagnosis":"..."}'),
            a("Delete record", "DELETE", "/api/medical-records/{id}", confirm="DELETE"),
        ]),
        ("Prescriptions", [
            a("List prescriptions", "GET", "/api/prescriptions"),
            a("Add prescription", "POST", "/api/prescriptions", '{"patient_id":1,"doctor_id":1,"medicine_id":1,"dosage":"...","frequency":"...","duration":"..."}'),
            a("View prescription", "GET", "/api/prescriptions/{id}"),
            a("Update prescription", "PATCH", "/api/prescriptions/{id}", '{"dosage":"..."}'),
            a("Delete prescription", "DELETE", "/api/prescriptions/{id}", confirm="DELETE"),
        ]),
        ("Laboratory", [
            a("List laboratory tests", "GET", "/api/laboratory/tests"),
            a("Create laboratory test", "POST", "/api/laboratory/tests", '{"patient_id":1,"doctor_id":1,"test_name":"..."}'),
            a("View laboratory test", "GET", "/api/laboratory/tests/{id}"),
            a("Update laboratory test", "PATCH", "/api/laboratory/tests/{id}", '{"status":"...","result":"..."}'),
        ]),
        ("Pharmacy", [
            a("List medicines", "GET", "/api/pharmacy/medicines"),
            a("Add medicine", "POST", "/api/pharmacy/medicines", '{"name":"...","price":0,"stock_quantity":0}'),
            a("View medicine", "GET", "/api/pharmacy/medicines/{id}"),
            a("Update medicine", "PATCH", "/api/pharmacy/medicines/{id}", '{"price":0,"stock_quantity":0}'),
            a("Delete medicine", "DELETE", "/api/pharmacy/medicines/{id}", confirm="DELETE"),
        ]),
        ("Billing and reports", [
            a("List invoices", "GET", "/api/billing/invoices"),
            a("Create invoice", "POST", "/api/billing/invoices", '{"patient_id":1,"items":[{"description":"...","quantity":1,"unit_price":0}]}'),
            a("View invoice", "GET", "/api/billing/invoices/{id}"),
            a("Cancel invoice", "POST", "/api/billing/invoices/{id}/cancel", confirm="CANCEL INVOICE"),
            a("Record payment", "POST", "/api/billing/invoices/{id}/payments", '{"amount":0,"method":"cash"}'),
            a("Outstanding invoices", "GET", "/api/billing/outstanding"),
            a("Revenue report", "GET", "/api/reports/revenue"),
            a("Payments report", "GET", "/api/reports/payments"),
        ]),
        ("Notifications", [
            a("List notifications", "GET", "/api/notifications/{user_id}"),
            a("Mark notification read", "PATCH", "/api/notifications/{user_id}/{id}/read"),
        ]),
    ],
    "doctor": [
        ("Appointments", [
            a("My schedule", "GET", "/api/appointments", query="date"),
            a("Book appointment", "POST", "/api/appointments", special="book"),
            a("View appointment", "GET", "/api/appointments/{id}"),
            a("Update appointment", "PUT", "/api/appointments/{id}", '{"appointment_date":"YYYY-MM-DD","appointment_time":"HH:MM","status":"completed"}'),
            a("Cancel appointment", "PATCH", "/api/appointments/{id}/cancel", confirm="CANCEL"),
        ]),
        ("Patients", [
            a("Search/list patients", "GET", "/api/patients", query="patient_search"),
            a("View patient", "GET", "/api/patients/{id}"),
        ]),
        ("Doctors", [
            a("View doctor directory", "GET", "/api/doctors"),
            a("View doctor", "GET", "/api/doctors/{id}"),
        ]),
        ("Medical records", [
            a("List records", "GET", "/api/medical-records"),
            a("Add record", "POST", "/api/medical-records", '{"patient_id":1,"diagnosis":"...","treatment":"..."}'),
            a("View record", "GET", "/api/medical-records/{id}"),
            a("Update record", "PATCH", "/api/medical-records/{id}", '{"diagnosis":"..."}'),
        ]),
        ("Prescriptions", [
            a("List prescriptions", "GET", "/api/prescriptions"),
            a("Add prescription", "POST", "/api/prescriptions", '{"patient_id":1,"doctor_id":1,"medicine_id":1,"dosage":"...","frequency":"...","duration":"..."}'),
            a("View prescription", "GET", "/api/prescriptions/{id}"),
            a("Update prescription", "PATCH", "/api/prescriptions/{id}", '{"dosage":"..."}'),
        ]),
        ("Laboratory", [
            a("List laboratory tests", "GET", "/api/laboratory/tests"),
            a("Request laboratory test", "POST", "/api/laboratory/tests", '{"patient_id":1,"doctor_id":1,"test_name":"..."}'),
            a("View laboratory test", "GET", "/api/laboratory/tests/{id}"),
            a("Update test result/status", "PATCH", "/api/laboratory/tests/{id}", '{"status":"...","result":"..."}'),
        ]),
        ("Pharmacy", [
            a("View medicines", "GET", "/api/pharmacy/medicines"),
            a("View medicine", "GET", "/api/pharmacy/medicines/{id}"),
        ]),
        ("Notifications", [
            a("List notifications", "GET", "/api/notifications/{user_id}"),
            a("Mark notification read", "PATCH", "/api/notifications/{user_id}/{id}/read"),
        ]),
    ],
    "patient": [
        ("My profile", [
            a("View my profile", "GET", "/api/patients/{user_id}"),
            a("Update my profile", "PATCH", "/api/patients/{user_id}", '{"username":"...","email":"..."}'),
        ]),
        ("Doctors", [
            a("View doctor directory", "GET", "/api/doctors"),
            a("View doctor", "GET", "/api/doctors/{id}"),
        ]),
        ("Appointments", [
            a("List my appointments", "GET", "/api/appointments", query="date"),
            a("Book appointment", "POST", "/api/appointments", special="book"),
            a("View appointment", "GET", "/api/appointments/{id}"),
            a("Cancel my appointment", "PATCH", "/api/appointments/{id}/cancel", confirm="CANCEL"),
        ]),
        ("My health", [
            a("Medical records", "GET", "/api/medical-records"),
            a("View medical record", "GET", "/api/medical-records/{id}"),
            a("Prescriptions", "GET", "/api/prescriptions"),
            a("View prescription", "GET", "/api/prescriptions/{id}"),
            a("Laboratory tests", "GET", "/api/laboratory/tests"),
            a("View laboratory test", "GET", "/api/laboratory/tests/{id}"),
        ]),
        ("My bills", [
            a("List my invoices", "GET", "/api/billing/invoices"),
            a("View invoice", "GET", "/api/billing/invoices/{id}"),
        ]),
        ("Notifications", [
            a("List notifications", "GET", "/api/notifications/{user_id}"),
            a("Mark notification read", "PATCH", "/api/notifications/{user_id}/{id}/read"),
        ]),
    ],
}


def print_response(response):
    print(f"\nHTTP {response.status_code}")
    if response.status_code == 204:
        print("Completed successfully (no response body).\n")
        return response.status_code
    body = response.get_json(silent=True)
    if body is None:
        print(response.get_data(as_text=True).strip() or "No response body.")
    else:
        pprint(body, sort_dicts=False)
    print()
    return response.status_code


def request_json_body(action):
    print("\nExpected JSON shape (replace example values with real values):")
    print(action.body_hint)
    raw = input("JSON body (one line): ").strip()
    try:
        body = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"Invalid JSON: {exc}")
        return None, False
    if not isinstance(body, dict):
        print("Enter a JSON object.")
        return None, False
    return body, True


def query_values(kind):
    if kind == "date":
        value = input("Appointment date YYYY-MM-DD (blank for all): ").strip()
        if value:
            try:
                datetime.strptime(value, "%Y-%m-%d")
            except ValueError:
                print("Use YYYY-MM-DD.")
                return None
            return {"appointment_date": value}
        return {}
    if kind == "patient_search":
        value = input("Patient username/email search (blank for all): ").strip()
        page = input("Page number [1]: ").strip() or "1"
        if not page.isdigit() or int(page) < 1:
            print("Page must be a positive whole number.")
            return None
        query = {"page": page}
        if value:
            query["search"] = value
        return query
    if kind == "role":
        value = input("Filter by role (blank for all): ").strip()
        return {"role": value} if value else {}
    return {}


def resolve_path(path, user):
    if "{id}" in path:
        record_id = input("Record ID: ").strip()
        if not record_id.isdigit() or int(record_id) < 1:
            print("Enter a positive numeric ID.")
            return None
        path = path.format(id=record_id, user_id=user["id"])
    else:
        path = path.format(user_id=user["id"])
    return path


def execute_action(client, user, headers, action):
    if action.special == "book":
        book_appointment(client, user, headers)
        return True

    path = resolve_path(action.path, user)
    if path is None:
        return True

    query = query_values(action.query)
    if query is None:
        return True

    payload = None
    if action.body_hint:
        payload, valid = request_json_body(action)
        if not valid:
            return True

    if action.confirm and input(f"Type {action.confirm} to confirm: ").strip() != action.confirm:
        print("Action cancelled.")
        return True

    response = client.open(
        path,
        method=action.method,
        headers=headers,
        json=payload,
        query_string=query,
    )
    status = print_response(response)
    if status == 401:
        print("The token was rejected. Returning to sign-in.")
        return False
    if status in {200, 201} and action.label == "Add patient account":
        print("Note: this route creates a User account only; it does not create the Patient profile.")
    if status == 403 and user["role"] == "doctor" and "/api/patients" in path:
        print(
            "The guide assigns patient create/edit/delete to doctors, but the current "
            "backend routes allow doctors to list and view patients only."
        )
    return True


def list_booking_profiles(role):
    if role != "patient":
        patients = Patient.query.order_by(Patient.id).all()
        if not patients:
            print("No Patient profiles exist yet.")
            return None
        print("\nPatient profile IDs:")
        for patient in patients:
            print(f"  {patient.id}: {patient.name}")

    if role != "doctor":
        doctors = Doctor.query.order_by(Doctor.id).all()
        if not doctors:
            print("No Doctor profiles exist yet.")
            return None
        print("\nDoctor profile IDs:")
        for doctor in doctors:
            name = doctor.user.username if doctor.user else "Unknown doctor"
            specialty = doctor.speciality.name if doctor.speciality else "No specialty"
            state = "available" if doctor.availability_status else "unavailable"
            print(f"  {doctor.id}: {name} | {specialty} | {state}")
    return True


def book_appointment(client, user, headers):
    role = user["role"]
    patient_id = None
    doctor_id = None
    if role == "patient":
        patient = Patient.query.filter_by(user_id=int(user["id"])).first()
        if patient is None:
            print("Your account has no Patient profile. The signup route currently creates only a User account.")
            return
        patient_id = patient.id
    if role == "doctor":
        doctor = Doctor.query.filter_by(user_id=int(user["id"])).first()
        if doctor is None:
            print("Your account has no Doctor profile. The signup route currently creates only a User account.")
            return
        doctor_id = doctor.id

    if list_booking_profiles(role) is None:
        return
    if role != "patient":
        value = input("Patient profile ID: ").strip()
        if not value.isdigit() or int(value) < 1:
            print("Enter a positive numeric patient profile ID.")
            return
        patient_id = int(value)
    if role != "doctor":
        value = input("Doctor profile ID: ").strip()
        if not value.isdigit() or int(value) < 1:
            print("Enter a positive numeric doctor profile ID.")
            return
        doctor_id = int(value)

    day = input("Appointment date (YYYY-MM-DD): ").strip()
    start = input("Start time (HH:MM): ").strip()
    end = input("End time (HH:MM): ").strip()
    try:
        datetime.strptime(day, "%Y-%m-%d")
        start_dt = datetime.strptime(start, "%H:%M")
        end_dt = datetime.strptime(end, "%H:%M")
    except ValueError:
        print("Use YYYY-MM-DD for the date and HH:MM for each time.")
        return
    if end_dt <= start_dt:
        print("End time must be later than start time.")
        return
    print(f"Book profile {patient_id} with doctor {doctor_id} on {day}, {start}–{end}?")
    if input("Type BOOK to confirm: ").strip() != "BOOK":
        print("Booking cancelled.")
        return

    response = client.post(
        "/api/appointments",
        headers=headers,
        json={
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "appointment_date": day,
            "start_time": start,
            "end_time": end,
        },
    )
    status = print_response(response)
    if status == 409:
        print("That appointment conflicts with another booking. Choose another time.")


def sign_in(client):
    while True:
        print("\nAfyaCare sign in (enter q to return)")
        username = input("Username: ").strip()
        if username.lower() == "q":
            return None
        password = getpass("Password: ")
        response = client.post("/api/auth/login", json={"username": username, "password": password})
        user = response.get_json(silent=True) or {}
        if response.status_code != 200:
            print_response(response)
            continue
        if user.get("role") not in MENUS or not user.get("access_token"):
            print(f"Role {user.get('role')!r} is not supported by this three-portal CLI.")
            return None
        print(f"Signed in as {user.get('username', username)} ({user['role']}).")
        return user, {"Authorization": f"Bearer {user['access_token']}"}


def sign_up(client):
    print("\nCreate an account: 1. Patient  2. Doctor")
    role = {"1": "patient", "2": "doctor"}.get(input("Choose a role: ").strip())
    if role is None:
        print("Choose patient or doctor.")
        return None
    username = input("Username: ").strip()
    email = input("Email: ").strip()
    password = getpass("Password: ")
    confirmation = getpass("Confirm password: ")
    response = client.post(
        "/api/auth/signup",
        json={
            "username": username,
            "email": email,
            "password": password,
            "password_confirmation": confirmation,
            "role": role,
        },
    )
    user = response.get_json(silent=True) or {}
    if response.status_code != 201:
        print_response(response)
        return None
    print("Account created. The current signup endpoint does not create a Patient or Doctor profile.")
    if not user.get("access_token"):
        return None
    return user, {"Authorization": f"Bearer {user['access_token']}"}


def navigate(client, user, headers):
    groups = MENUS[user["role"]]
    while True:
        print(f"\nAfyaCare {user['role'].title()} Menu")
        for i, (group, _) in enumerate(groups, 1):
            print(f"{i}. {group}")
        print(f"{len(groups) + 1}. Book appointment")
        print("0. Log out\nq. Quit")
        choice = input("Choose an option: ").strip().lower()
        if choice == "q":
            return False
        if choice == "0":
            print("Signed out locally. The backend logout route does not revoke JWTs.")
            return True
        if choice == str(len(groups) + 1):
            book_appointment(client, user, headers)
            continue
        if not choice.isdigit() or not 1 <= int(choice) <= len(groups):
            print("Choose one of the listed options.")
            continue

        group_name, actions = groups[int(choice) - 1]
        if user["role"] == "doctor" and group_name == "Patients":
            print(
                "The guide assigns patient add/edit/delete to doctors, but the current "
                "backend permits doctors to list and view patients only. Update the "
                "patient route permissions before enabling those actions."
            )
        while True:
            print(f"\n{group_name}")
            for i, action in enumerate(actions, 1):
                print(f"{i}. {action.label} [{action.method}]")
            print("0. Back")
            action_choice = input("Choose an action: ").strip()
            if action_choice == "0":
                break
            if not action_choice.isdigit() or not 1 <= int(action_choice) <= len(actions):
                print("Choose one of the listed actions.")
                continue
            if not execute_action(client, user, headers, actions[int(action_choice) - 1]):
                return True


def main():
    app = create_app()
    with app.app_context(), app.test_client() as client:
        while True:
            print("\nAfyaCare CLI\n1. Sign in\n2. Sign up\nq. Quit")
            choice = input("Choose an option: ").strip().lower()
            if choice == "q":
                return
            if choice == "1":
                session = sign_in(client)
            elif choice == "2":
                session = sign_up(client)
            else:
                print("Choose sign in, sign up, or quit.")
                continue
            if session is None:
                continue
            user, headers = session
            if not navigate(client, user, headers):
                return


if __name__ == "__main__":
    main()

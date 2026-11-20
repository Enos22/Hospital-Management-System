
from app import create_app
from app.extensions import db, bcrypt
from app.models import (
    Appointment,
    AuditLog,
    Doctor,
    Invoice,
    InvoiceItem,
    LabRequest,
    LabResult,
    MedicalRecord,
    Medicine,
    Notification,
    Patient,
    Payment,
    Prescription,
    Speciality,
    User,
)
from datetime import date, datetime, time, timedelta

app = create_app()

SEED_USERS = [
    {
        "username": "admin",
        "email": "admin@afyacare.com",
        "password": "Admin@123",
        "role": "admin",
    },
    {
        "username": "doctor1",
        "email": "doctor1@afyacare.com",
        "password": "Doctor@123",
        "role": "doctor",
    },
    {
        "username": "patient1",
        "email": "patient1@afyacare.com",
        "password": "Patient@123",
        "role": "patient",
    },
    {
        "username": "receptionist",
        "email": "receptionist@afyacare.com",
        "password": "Reception@123",
        "role": "receptionist",
    },
    {
        "username": "billing",
        "email": "billing@afyacare.com",
        "password": "Billing@123",
        "role": "billing",
    },
]


def seed_data():
    with app.app_context():
        users_created = 0
        for data in SEED_USERS:
            existing_user = User.query.filter(
                (User.username == data["username"]) |
                (User.email == data["email"])
            ).first()
            if existing_user:
                continue

            hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
            user = User(
                username=data["username"],
                email=data["email"],
                password_hash=hashed_password,
                role=data["role"],
            )
            db.session.add(user)
            users_created += 1

        db.session.commit()
        return users_created


def seed_specialties():
    specialties = [
        {
            "name": "Cardiology",
            "description": "Heart and cardiovascular care"
        },
        {
            "name": "Pediatrics",
            "description": "Medical care for children"
        },
        {
            "name": "Dermatology",
            "description": "Skin, hair and nail care"
        },
        {
            "name": "General Medicine",
            "description": "General medical consultations"
        },
        {
            "name": "Neurology",
            "description": "Brain and nervous system care"
        }
    ]

    for item in specialties:
        existing = Speciality.query.filter_by(
            name=item["name"]
        ).first()

        if not existing:
            speciality = Speciality(**item)
            db.session.add(speciality)

    db.session.commit()
    print("Specialties seeded successfully!")

def seed_users():
    added = 0

    for data in SEED_USERS:

        existing_user = User.query.filter(
            (User.username == data["username"]) |
            (User.email == data["email"])
        ).first()

        if existing_user:
            print(f"{data['username']} already exists.")
            continue

        hashed_password = bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8")

        user = User(
            username=data["username"],
            email=data["email"],
            password_hash=hashed_password,
            role=data["role"]
        )

        db.session.add(user)
        added += 1

    db.session.commit()

    print(f"Successfully seeded {added} users!")

def create_user(username, email, password, role):
    email = email.strip().replace(" ", "")
    user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()
    if user is not None:
        if user.username != username or user.email != email:
            raise ValueError(
                f"Seed user identity conflicts with existing user {user.id}"
            )
        return user

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        role=role
    )

    db.session.add(user)
    db.session.flush()

    return user



def seed_admin():
    create_user(
        username="admin",
        email="admin@afyacare.com",
        password="Admin12345",
        role="admin"
    )

    db.session.commit()
    print("Admin seeded successfully!")


def seed_doctors():
    doctors = [
        {
            "username": "doctor1",
            "speciality": "General Medicine",
            "email": "doctor1@afyacare.com",
            "password_hash": "Doctor@123",
            "license_number": "DOC000",
            "qualification": "MBChB",
            "phone_number": "0700000000"
        },
        {
            "username": "Mary Wanjiku",
            "speciality_id": 1,
            "email": "mary@afyacare.com",
            "password_hash": "Doctor12345",
            "speciality": "Cardiology",
            "license_number": "DOC001",
            "qualification": "MBChB",
            "phone_number": "0700000001"
        },
        {
            "username": "James Mwangi",
            "speciality_id": 2,
            "email": "james@afyacare.com",
            "password_hash": "Doctor12345",
            "speciality": "Pediatrics",
            "license_number": "DOC002",
            "qualification": "MBChB",
            "phone_number": "0700000002"
        },
        {
            "username": "Grace Achieng",
            "speciality_id": 3,
            "email": "grace@afyacare.com",
            "password_hash": "Doctor12345",
            "speciality": "Dermatology",
            "license_number": "DOC003",
            "qualification": "MBChB",
            "phone_number": "0700000003"
        }
    ]

    for item in doctors:
        user = create_user(
            item["username"],
            item["email"],
            item["password_hash"],
            "doctor"
        )

        existing = Doctor.query.filter_by(
            user_id=user.id
        ).first()

        if not existing:
            speciality = Speciality.query.filter_by(
                name=item["speciality"]
            ).first()

            if not speciality:
                print(f"Speciality not found: {item['speciality']}")
                

            doctor = Doctor(
                user_id=user.id,
                speciality_id=speciality.id,
                license_number=item["license_number"],
                qualification=item["qualification"],
                phone_number=item["phone_number"],
                availability_status=True
            )

            db.session.add(doctor)

    db.session.commit()
    print("Doctors seeded successfully!")

def seed_payments():
    payments = [
        {
            "username": "Mary Wanjiku",
            "amount": 2500.00,
            "payment_method": "M-Pesa",
            "status": "completed"
        },
        {
            "username": "James Mwangi",
            "amount": 4500.00,
            "payment_method": "Cash",
            "status": "completed"
        },
        {
            "username": "Grace Achieng",
            "amount": 1500.00,
            "payment_method": "Card",
            "status": "pending"
        },
        {
            "username": "John Kamau",
            "amount": 3000.00,
            "payment_method": "M-Pesa",
            "status": "completed"
        },
        {
            "username": "Sarah Njeri",
            "amount": 5000.00,
            "payment_method": "Insurance",
            "status": "pending"
        },
        {
            "username": "Peter Otieno",
            "amount": 2000.00,
            "payment_method": "Cash",
            "status": "completed"
        }
    ]

    for item in payments:
        user = User.query.filter_by(
            username=item["username"]
        ).first()

        if not user:
            print(f"User not found: {item['username']}")
            continue

        existing = Payment.query.filter_by(
            user_id=user.id,
            amount=item["amount"]
        ).first()

        if not existing:
            payment = Payment(
                user_id=user.id,
                amount=item["amount"],
                payment_method=item["payment_method"],
                status=item["status"]
            )

            db.session.add(payment)

    db.session.commit()
    print("Payments seeded successfully!")

def seed_medicines():

    medicines_data = [
        {
            "name": "Paracetamol",
            "description": "Pain reliever and fever reducer.",
            "price": 50.00,
            "stock_quantity": 200
        },
        {
            "name": "Amoxicillin",
            "description": "Antibiotic used to treat certain bacterial infections.",
            "price": 150.00,
            "stock_quantity": 100
        },
        {
            "name": "Ibuprofen",
            "description": "Used to relieve pain, inflammation and fever.",
            "price": 80.00,
            "stock_quantity": 150
        },
        {
            "name": "Cetirizine",
            "description": "Antihistamine used to relieve allergy symptoms.",
            "price": 100.00,
            "stock_quantity": 120
        },
        {
            "name": "Metformin",
            "description": "Medicine used to help manage type 2 diabetes.",
            "price": 200.00,
            "stock_quantity": 90
        },
        {
            "name": "Omeprazole",
            "description": "Reduces stomach acid production.",
            "price": 180.00,
            "stock_quantity": 80
        },
        {
            "name": "Vitamin C",
            "description": "Vitamin supplement.",
            "price": 120.00,
            "stock_quantity": 250
        },
        {
            "name": "ORS",
            "description": "Oral rehydration salts used to prevent dehydration.",
            "price": 30.00,
            "stock_quantity": 300
        }
    ]

    added = 0

    for data in medicines_data:

        existing = Medicine.query.filter_by(
            name=data["name"]
        ).first()

        if existing:
            print(f"{data['name']} already exists.")
            continue

        medicine = Medicine(**data)

        db.session.add(medicine)
        added += 1

    db.session.commit()

    print(f"Successfully seeded {added} medicines!")

def seed_notifications():

    users = User.query.all()

    if not users:
        print("No users found. Seed users first.")
        return

    notifications_data = [
        {
            "user_id": users[0].id,
            "message": "Welcome to AfyaCare Hospital Management System.",
            "is_read": False
        },
        {
            "user_id": users[0].id,
            "message": "Your appointment has been successfully scheduled.",
            "is_read": False
        },
        {
            "user_id": users[-1].id,
            "message": "Your prescription has been updated by your doctor.",
            "is_read": False
        },
        {
            "user_id": users[-1].id,
            "message": "Your recent hospital payment has been received.",
            "is_read": True
        },
        {
            "user_id": users[0].id,
            "message": "Reminder: Please arrive early for your upcoming appointment.",
            "is_read": False
        },
        {
            "user_id": users[-1].id,
            "message": "Your hospital invoice is available for review.",
            "is_read": False
        }
    ]

    added = 0

    for data in notifications_data:

        # Prevent duplicate notifications
        existing = Notification.query.filter_by(
            user_id=data["user_id"],
            message=data["message"]
        ).first()

        if existing:
            continue

        notification = Notification(**data)

        db.session.add(notification)
        added += 1

    db.session.commit()

    print(f"Successfully seeded {added} notifications!")

def seed_prescriptions():

    # Get existing records
    patients = Patient.query.all()
    doctors = Doctor.query.all()
    medicines = Medicine.query.all()

    if not patients:
        print("No patients found. Seed patients first.")
        return

    if not doctors:
        print("No doctors found. Seed doctors first.")
        return

    if not medicines:
        print("No medicines found. Seed medicines first.")
        return

    prescriptions_data = [
        {
            "patient_id": patients[0].id,
            "doctor_id": doctors[0].id,
            "medicine_id": medicines[0].id,
            "dosage": "500mg",
            "frequency": "Twice daily",
            "duration": "7 days"
        },
        {
            "patient_id": patients[-1].id,
            "doctor_id": doctors[-1].id,
            "medicine_id": medicines[-1].id,
            "dosage": "250mg",
            "frequency": "Three times daily",
            "duration": "5 days"
        },
        {
            "patient_id": patients[0].id,
            "doctor_id": doctors[-1].id,
            "medicine_id": medicines[-1].id,
            "dosage": "One tablet",
            "frequency": "Once daily",
            "duration": "14 days"
        },
        {
            "patient_id": patients[-1].id,
            "doctor_id": doctors[0].id,
            "medicine_id": medicines[0].id,
            "dosage": "One tablet",
            "frequency": "Twice daily",
            "duration": "10 days"
        }
    ]

    added = 0

    for data in prescriptions_data:

        # Prevent duplicate prescriptions
        existing = Prescription.query.filter_by(
            patient_id=data["patient_id"],
            doctor_id=data["doctor_id"],
            medicine_id=data["medicine_id"],
            dosage=data["dosage"],
            frequency=data["frequency"],
            duration=data["duration"]
        ).first()

        if existing:
            continue

        prescription = Prescription(**data)

        db.session.add(prescription)
        added += 1

    db.session.commit()

    print(f"Successfully seeded {added} prescriptions!")

def seed_lab_results():

    patients = Patient.query.all()

    if not patients:
        print("No patients found. Seed patients first.")
        return

    today = datetime.now()

    lab_results_data = [
        {
            "patient_id": patients[0].id,
            "test_name": "Full Blood Count (FBC)",
            "result_value": "Normal",
            "result_date": today - timedelta(days=5)
        },
        {
            "patient_id": patients[0].id,
            "test_name": "Blood Sugar Test",
            "result_value": "5.6 mmol/L",
            "result_date": today - timedelta(days=3)
        },
        {
            "patient_id": patients[-1].id,
            "test_name": "Malaria Test",
            "result_value": "Negative",
            "result_date": today - timedelta(days=4)
        },
        {
            "patient_id": patients[-1].id,
            "test_name": "Blood Pressure Test",
            "result_value": "120/80 mmHg",
            "result_date": today - timedelta(days=2)
        },
        {
            "patient_id": patients[0].id,
            "test_name": "Urine Analysis",
            "result_value": "Normal",
            "result_date": today - timedelta(days=1)
        },
        {
            "patient_id": patients[-1].id,
            "test_name": "Cholesterol Test",
            "result_value": "180 mg/dL",
            "result_date": today
        }
    ]

    added = 0

    for data in lab_results_data:

        # Prevent duplicate lab results
        existing = LabResult.query.filter_by(
            patient_id=data["patient_id"],
            test_name=data["test_name"],
            result_value=data["result_value"]
        ).first()

        if existing:
            continue

        lab_result = LabResult(**data)

        db.session.add(lab_result)
        added += 1

    db.session.commit()

    print(f"Successfully seeded {added} lab results!")

def seed_lab_requests():

    patients = Patient.query.all()
    doctors = Doctor.query.all()

    if not patients:
        print("No patients found. Seed patients first.")
        return

    if not doctors:
        print("No doctors found. Seed doctors first.")
        return

    lab_requests_data = [
        {
            "patient_id": patients[0].id,
            "doctor_id": doctors[0].id,
            "test_type": "Full Blood Count (FBC)",
            "status": "Pending"
        },
        {
            "patient_id": patients[0].id,
            "doctor_id": doctors[-1].id,
            "test_type": "Blood Sugar Test",
            "status": "Completed"
        },
        {
            "patient_id": patients[-1].id,
            "doctor_id": doctors[0].id,
            "test_type": "Malaria Test",
            "status": "In Progress"
        },
        {
            "patient_id": patients[-1].id,
            "doctor_id": doctors[-1].id,
            "test_type": "Urine Analysis",
            "status": "Pending"
        },
        {
            "patient_id": patients[0].id,
            "doctor_id": doctors[0].id,
            "test_type": "Liver Function Test",
            "status": "Completed"
        },
        {
            "patient_id": patients[-1].id,
            "doctor_id": doctors[-1].id,
            "test_type": "Kidney Function Test",
            "status": "Pending"
        }
    ]

    added = 0

    for data in lab_requests_data:

        # Prevent duplicate requests
        existing = LabRequest.query.filter_by(
            patient_id=data["patient_id"],
            doctor_id=data["doctor_id"],
            test_type=data["test_type"]
        ).first()

        if existing:
            continue

        lab_request = LabRequest(**data)

        db.session.add(lab_request)
        added += 1

    db.session.commit()

    print(f"Successfully seeded {added} lab requests!")

def seed_medical_records():

    patients = Patient.query.all()

    if not patients:
        print("No patients found. Seed patients first.")
        return

    today = datetime.now()

    medical_records_data = [
        {
            "patient_id": patients[0].id,
            "diagnosis": "Common cold",
            "treatment": "Rest, adequate fluids and supportive care.",
            "record_date": today - timedelta(days=10)
        },
        {
            "patient_id": patients[0].id,
            "diagnosis": "Malaria",
            "treatment": "Treatment according to the prescribed antimalarial regimen.",
            "record_date": today - timedelta(days=5)
        },
        {
            "patient_id": patients[-1].id,
            "diagnosis": "Hypertension",
            "treatment": "Blood pressure monitoring and clinician-directed management.",
            "record_date": today - timedelta(days=15)
        },
        {
            "patient_id": patients[-1].id,
            "diagnosis": "Upper respiratory tract infection",
            "treatment": "Clinical assessment and supportive treatment.",
            "record_date": today - timedelta(days=3)
        },
        {
            "patient_id": patients[0].id,
            "diagnosis": "Gastritis",
            "treatment": "Dietary advice and clinician-directed medication.",
            "record_date": today - timedelta(days=2)
        },
        {
            "patient_id": patients[-1].id,
            "diagnosis": "Type 2 diabetes",
            "treatment": "Blood glucose monitoring and individualized management.",
            "record_date": today - timedelta(days=1)
        }
    ]

    added = 0

    for data in medical_records_data:

        # Prevent duplicate records
        existing = MedicalRecord.query.filter_by(
            patient_id=data["patient_id"],
            diagnosis=data["diagnosis"]
        ).first()

        if existing:
            continue

        record = MedicalRecord(**data)

        db.session.add(record)
        added += 1

    db.session.commit()

    print(f"Successfully seeded {added} medical records!")

def seed_appointments():

    patients = Patient.query.all()
    doctors = Doctor.query.all()

    if not patients:
        print("No patients found. Seed patients first.")
        return

    if not doctors:
        print("No doctors found. Seed doctors first.")
        return

    today = date.today()

    appointments_data = [
        {
            "patient_id": patients[0].id,
            "doctor_id": doctors[0].id,
            "appointment_date": datetime.combine(
                today + timedelta(days=1), time.min
            ),
            "appointment_time": time(9, 0),
            "status": "Scheduled"
        },
        {
            "patient_id": patients[0].id,
            "doctor_id": doctors[-1].id,
            "appointment_date": datetime.combine(
                today + timedelta(days=2), time.min
            ),
            "appointment_time": time(10, 30),
            "status": "Scheduled"
        },
        {
            "patient_id": patients[-1].id,
            "doctor_id": doctors[0].id,
            "appointment_date": datetime.combine(
                today - timedelta(days=2), time.min
            ),
            "appointment_time": time(11, 0),
            "status": "Completed"
        },
        {
            "patient_id": patients[-1].id,
            "doctor_id": doctors[-1].id,
            "appointment_date": datetime.combine(
                today + timedelta(days=3), time.min
            ),
            "appointment_time": time(14, 0),
            "status": "Scheduled"
        },
        {
            "patient_id": patients[0].id,
            "doctor_id": doctors[0].id,
            "appointment_date": datetime.combine(
                today - timedelta(days=5), time.min
            ),
            "appointment_time": time(15, 0),
            "status": "Cancelled"
        }
    ]

    added = 0

    for data in appointments_data:

        # Prevent duplicate appointments
        existing = Appointment.query.filter_by(
            patient_id=data["patient_id"],
            doctor_id=data["doctor_id"],
            appointment_date=data["appointment_date"],
            appointment_time=data["appointment_time"]
        ).first()

        if existing:
            continue

        appointment = Appointment(**data)

        db.session.add(appointment)
        added += 1

    db.session.commit()

    print(f"Successfully seeded {added} appointments!")

def seed_audit_logs():
    admin = User.query.filter_by(email="admin@afyacare.com").first()
    doctor = Doctor.query.order_by(Doctor.id).first()
    patient = Patient.query.order_by(Patient.id).first()
    appointment = Appointment.query.order_by(Appointment.id).first()
    medical_record = MedicalRecord.query.order_by(MedicalRecord.id).first()
    invoice = Invoice.query.order_by(Invoice.id).first()
    if not all((admin, doctor, patient, appointment, medical_record, invoice)):
        raise RuntimeError("Seed users and workflows before audit logs")

    audit_log_data = [
        (admin.id, "CREATE", "patients", patient.id),
        (admin.id, "UPDATE", "patients", patient.id),
        (admin.id, "CREATE", "doctors", doctor.id),
        (doctor.user_id, "UPDATE", "appointments", appointment.id),
        (patient.user_id, "CREATE", "appointments", appointment.id),
        (admin.id, "UPDATE", "invoices", invoice.id),
        (doctor.user_id, "CREATE", "medical_records", medical_record.id),
        (admin.id, "UPDATE", "doctors", doctor.id),
    ]

    added = 0
    for user_id, action, table_name, record_id in audit_log_data:
        existing = AuditLog.query.filter_by(
            user_id=user_id,
            action=action,
            table_name=table_name,
            record_id=record_id,
        ).first()
        if existing is None:
            db.session.add(
                AuditLog(
                    user_id=user_id,
                    action=action,
                    table_name=table_name,
                    record_id=record_id,
                )
            )
            added += 1
    db.session.commit()

    print(f"Successfully seeded {added} audit logs!")

def seed_invoices():

    patients = Patient.query.all()
    appointments = Appointment.query.all()

    if not patients:
        print("No patients found. Seed patients first.")
        return

    if not appointments:
        print("No appointments found. Seed appointments first.")
        return

    invoices_data = [
        {
            "patient_id": appointments[0].patient_id,
            "appointment_id": appointments[0].id,
            "total_amount": 2500.00,
            "amount_paid": 0.00,
            "status": "unpaid",
            "item_description": "Consultation"
        },
        {
            "patient_id": appointments[1].patient_id,
            "appointment_id": appointments[1].id,
            "total_amount": 5000.00,
            "amount_paid": 5000.00,
            "status": "paid",
            "item_description": "Consultation and diagnostics"
        },
        {
            "patient_id": appointments[-1].patient_id,
            "appointment_id": appointments[-1].id,
            "total_amount": 3500.00,
            "amount_paid": 1000.00,
            "status": "partial",
            "item_description": "Consultation and laboratory services"
        }
    ]

    added = 0

    for data in invoices_data:

        # Prevent duplicate invoices
        existing = Invoice.query.filter_by(
            appointment_id=data["appointment_id"]
        ).first()

        if existing is None:
            now = datetime.now()
            admin = User.query.filter_by(email="admin@afyacare.com").first()
            invoice = Invoice(
                patient_id=data["patient_id"],
                appointment_id=data["appointment_id"],
                invoice_number=f"INV-SEED-{data['appointment_id']:06d}",
                subtotal=data["total_amount"],
                tax_amount=0,
                discount_amount=0,
                total_amount=data["total_amount"],
                amount_paid=data["amount_paid"],
                status=data["status"],
                issued_at=now,
                due_date=(now + timedelta(days=30)).date(),
                created_by=admin.id if admin else None,
            )
            db.session.add(invoice)
            db.session.flush()
            existing = invoice
            added += 1

        if not existing.items:
            db.session.add(
                InvoiceItem(
                    invoice_id=existing.id,
                    description=data["item_description"],
                    quantity=1,
                    unit_price=data["total_amount"],
                    line_total=data["total_amount"],
                )
            )

        if data["amount_paid"] > 0 and not Payment.query.filter_by(
            invoice_id=existing.id
        ).first():
            db.session.add(
                Payment(
                    user_id=existing.patient.user_id,
                    invoice_id=existing.id,
                    amount=data["amount_paid"],
                    payment_method="cash",
                    reference=f"SEED-{existing.invoice_number}",
                    paid_at=existing.issued_at,
                    received_by=existing.created_by,
                    status="completed",
                )
            )

    db.session.commit()

    print(f"Successfully seeded {added} invoices!")

def seed_patients():
    patients = [
        {
            "username": "patient1",
            "name": "Patient One",
            "email": "patient1@afyacare.com",
            "phone_number": "0700000004",
            "age": 30,
            "gender": "Other",
            "address": "Nairobi",
            "emergency_contact": "0700000005"
        },
        {
            "name": "John Kamau",
            "email": "john@example.com",
            "phone_number": "0711111111",
            "age": 25,
            "gender": "Male",
            "address": "Nairobi",
            "emergency_contact": "0722222222"
        },
        {
            "name": "Sarah Njeri",
            "email": "sarah@example.com",
            "phone_number": "0711111112",
            "age": 23,
            "gender": "Female",
            "address": "Nairobi",
            "emergency_contact": "0722222223"
        },
        {
            "name": "Peter Otieno",
            
            "email": "peter@example.com",
            "phone_number": "0711111113",
            "age": 28,
            "gender": "Male",
            "address": "Kiambu",
            "emergency_contact": "0722222224"
        }
    ]


    for item in patients:
        user = create_user(
            item.get("username", item["name"]),
            item["email"],
            "Patient12345",
            "patient"
        )

        existing = Patient.query.filter_by(
            user_id=user.id
        ).first()

        if not existing:
            patient = Patient(
                user_id=user.id,
                name=item["name"],
                email=item["email"],
                age=item["age"],
                gender=item["gender"],
                phone_number=item["phone_number"],
                address=item["address"],
                created_at=db.func.current_timestamp(),
                updated_at=db.func.current_timestamp()
            )

            db.session.add(patient)

    db.session.commit()
    print("Patients seeded successfully!")


def seed_database():
    with app.app_context():
        try:
            db.create_all()
            seed_users()
            seed_specialties()
            seed_admin()
            seed_doctors()
            seed_patients()
            seed_medicines()
            seed_payments()
            seed_notifications()
            seed_prescriptions()
            seed_medical_records()
            seed_lab_results()
            seed_lab_requests()
            seed_appointments()
            seed_invoices()
            seed_audit_logs()

            print("\nAfyaCare database seeded successfully!")

        except Exception:
            db.session.rollback()
            raise


if __name__ == "__main__":
    seed_database()

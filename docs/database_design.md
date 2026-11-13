# Database design

The application uses SQLAlchemy models in `HMS-Backend/server/app/models/`. The default development store is SQLite. Database schema changes should be committed as Alembic migrations under `HMS-Backend/server/migrations/versions/`.

## Tables and relationships

| Table | Purpose and key relationships |
|---|---|
| `users` | Login identity, unique username/email, password hash, role |
| `patients` | Patient profile; one-to-one `user_id` to `users`; referenced by appointments, records, prescriptions, labs, and invoices |
| `doctors` | Doctor profile; references `users` and `specialities`; referenced by appointments, prescriptions, and lab requests |
| `specialities` | Unique medical specialty, referenced by doctors |
| `appointments` | References one patient and one doctor; stores date, start time, and status |
| `medical_records` | Patient diagnosis and treatment history |
| `prescriptions` | Patient/doctor/medicine relationship plus dosage, frequency, and duration |
| `medicines` | Pharmacy inventory and price; referenced by prescriptions |
| `lab_requests` | Patient/doctor test request and status |
| `lab_results` | Patient test name and result value |
| `invoices` | Patient invoice totals, status, optional appointment and creator |
| `invoice_items` | Invoice line items; invoice owns items with delete-orphan behavior |
| `payments` | Patient-user payment amount, method, status, optional invoice and receiving user |
| `notifications` | User-specific message and read status |
| `audit_logs` | Action/table/record metadata and actor ID |

The main relationships are:

```text
users 1--1 patients
users 1--1 doctors
specialities 1--many doctors
patients 1--many appointments, medical_records, prescriptions,
             lab_requests, lab_results, invoices
doctors 1--many appointments, prescriptions, lab_requests
medicines 1--many prescriptions
invoices 1--many invoice_items, payments
users 1--many payments, notifications
```

## Integrity and sensitive data

- Usernames and emails are unique; patient accounts reference one user.
- Foreign keys connect clinical, appointment, inventory, and billing data.
- Invoice totals and payment states are maintained by the billing service.
- Access checks scope patient reads for clinical records, prescriptions, laboratory data, appointments, invoices, balances, and notifications.
- Passwords are stored as bcrypt hashes. JWT signing secrets must be provisioned outside source control.
- Clinical records, lab results, and prescription data are sensitive health information; production access should be least-privilege and audited.

## Current modeling notes

- Appointment conflict checks consider an existing booking a 30-minute slot because the current table stores only a start time.
- `lab_results` currently associates a result by patient and test name rather than a foreign key to a particular lab request.
- `audit_logs` is present as a model; automatic audit-event creation is not currently wired to every data mutation.
- `db.create_all()` supports local startup but is not a substitute for reviewed migrations in deployed environments.

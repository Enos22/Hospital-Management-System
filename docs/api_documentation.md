# AfyaCare API reference

Base URL for local development: `http://127.0.0.1:5555`. JSON requests use `Content-Type: application/json`. Protected routes require `Authorization: Bearer <access_token>`. Tokens are returned by `POST /api/auth/signup` and `POST /api/auth/login`.

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create a patient or doctor user; public admin signup is rejected |
| POST | `/api/auth/login` | Public | Verify username/password and return a JWT |
| DELETE | `/api/auth/logout` | Public | Client-side token removal; the current implementation does not revoke tokens |
| GET | `/api/auth/checksession` | JWT | Return the authenticated user |

Example signup:

```json
{
  "username": "pat-001",
  "email": "pat-001@example.test",
  "password": "replace-with-a-strong-password",
  "password_confirmation": "replace-with-a-strong-password"
}
```

## Users and directories

| Method | Path | Access |
|---|---|---|
| GET | `/api/admin/dashboard` | Admin |
| GET | `/api/admin/users?page=1&per_page=20&role=patient` | Admin |
| PATCH / DELETE | `/api/admin/users/{id}` | Admin |
| GET | `/api/doctors` | Authenticated user |
| GET | `/api/doctors/{id}` | Authenticated user |
| POST | `/api/doctors` | Admin |
| PATCH / DELETE | `/api/doctors/{id}` | Admin |
| GET | `/api/patients?page=1&per_page=10&search=name` | Doctor or admin |
| POST | `/api/patients` | Admin |
| GET | `/api/patients/{id}` | Patient account owner, doctor, or admin |
| PATCH | `/api/patients/{id}` | Patient account owner or admin |
| DELETE | `/api/patients/{id}` | Admin |

For patient detail routes, `{id}` is the associated user ID.

## Appointments

All appointment routes require a JWT. Patient accounts can create, list, view, and cancel their own appointments. Doctors are scoped to their doctor profile; admins can manage all appointments.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/appointments?appointment_date=YYYY-MM-DD` | List accessible appointments |
| GET / PUT | `/api/appointments/{appointment_id}` | Retrieve or update an appointment |
| PATCH | `/api/appointments/{appointment_id}/cancel` | Cancel an appointment |

Booking request:

```json
{
  "patient_id": 1,
  "doctor_id": 1,
  "appointment_date": "2026-11-20",
  "start_time": "10:00",
  "end_time": "10:30"
}
```

Overlapping doctor or patient bookings return `409 Conflict`. The current appointment model represents an appointment by its start time; conflict checking treats existing appointments as 30-minute slots.

## Clinical records

Medical records, prescriptions, and laboratory result reads require authentication. Patients can read only their own data. Doctors and admins can read across patients. Create/update operations are limited to doctors/admins; medical-record deletion and prescription deletion are admin-only.

| Method | Path | Access |
|---|---|---|
| GET / POST | `/api/medical-records` | Read: owner, doctor, admin; create: doctor/admin |
| GET / PATCH / DELETE | `/api/medical-records/{record_id}` | Read: owner, doctor, admin; write: doctor/admin; delete: admin |
| GET | `/api/patients/{patient_id}/medical-history` | Patient owner, doctor, admin |
| GET / POST | `/api/prescriptions` | Read: owner, doctor, admin; create: doctor/admin |
| GET / PATCH / DELETE | `/api/prescriptions/{prescription_id}` | Read: owner, doctor, admin; write: doctor/admin; delete: admin |
| GET / POST | `/api/laboratory/tests` | Read: owner, doctor, admin; create: doctor/admin |
| GET / PATCH | `/api/laboratory/tests/{test_id}` | Read: owner, doctor, admin; update: doctor/admin |

Medical-record example:

```json
{
  "patient_id": 1,
  "diagnosis": "Seasonal allergy",
  "treatment": "Antihistamine"
}
```

Prescription creation requires `patient_id`, `doctor_id`, `medicine_id`, `dosage`, `frequency`, and `duration`. Laboratory requests require `patient_id`, `doctor_id`, and `test_name`; a result update accepts a non-empty `result` string.

## Pharmacy

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/pharmacy/medicines?page=1&per_page=10&search=tablet` | Doctor or admin | Search/paginate inventory |
| POST | `/api/pharmacy/medicines` | Admin | Add medicine |
| GET | `/api/pharmacy/medicines/{medicine_id}` | Doctor or admin | Read medicine |
| PATCH / DELETE | `/api/pharmacy/medicines/{medicine_id}` | Admin | Update or remove medicine |

## Billing and matching

Billing staff means a JWT role of `admin` or `billing`; patient accounts may read only their own invoices and balances.

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST / GET | `/api/billing/invoices` | Create: staff; list: staff or owner | Create/list invoices |
| GET | `/api/billing/invoices/{invoice_id}` | Staff or owner | Read invoice |
| POST | `/api/billing/invoices/{invoice_id}/cancel` | Staff | Cancel unpaid invoice |
| POST | `/api/billing/invoices/{invoice_id}/payments` | Staff | Record payment |
| GET | `/api/billing/patients/{patient_id}/balance` | Staff or owner | Read outstanding balance |
| GET | `/api/billing/outstanding` | Staff | Outstanding invoice report |
| GET | `/api/reports/revenue?start=YYYY-MM-DD&end=YYYY-MM-DD` | Staff | Revenue summary |
| GET | `/api/reports/payments?start=YYYY-MM-DD&end=YYYY-MM-DD` | Staff | Payment summary |
| GET | `/api/matching/doctors?specialty=General&date=YYYY-MM-DD` | JWT | Find available matching doctors |

Invoice creation accepts `patient_id`, `items` (each with `description`, optional integer `quantity`, and numeric `unit_price`), optional percentage `tax_rate`, and optional `discount`. Payment `method` must be one of `cash`, `card`, `mobile_money`, `bank_transfer`, or `insurance`. Invoice states are `unpaid`, `partial`, `paid`, and `cancelled`.

## Notifications and health

| Method | Path | Access |
|---|---|---|
| GET | `/api/notifications/{user_id}` | Owner or admin |
| PATCH | `/api/notifications/{user_id}/{notification_id}/read` | Owner or admin |
| GET | `/health` | Public |
| GET | `/` | Public |

Responses use JSON. Typical failures are `400` for invalid input, `401` for missing/invalid authentication, `403` for insufficient access, `404` for missing resources, and `409` for appointment conflicts.

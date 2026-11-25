# Project proposal

## Summary

AfyaCare is a hospital management system backend providing a single API for basic patient and doctor administration, scheduling, clinical documentation, pharmacy inventory, laboratory workflows, billing, payments, and notifications.

## Goals

- Provide authenticated role-based access to operational APIs.
- Keep patient-specific clinical and financial data scoped to the patient or authorized staff.
- Prevent overlapping appointment bookings for the same doctor or patient.
- Track medicine stock, lab work, invoices, and payment states.
- Support a React client through JSON REST endpoints.

## Users

- Patients view their own profile-related clinical and billing data and manage their appointments.
- Doctors manage assigned appointment work and clinical records.
- Administrators manage users, inventory, and system operations.
- Billing staff create invoices, record payments, and access financial reports.

## Scope and limitations

The backend is a Flask/SQLAlchemy service with SQLite as its development database. The current model and API coverage is described in the [API reference](./api_documentation.md). This project does not claim certification or regulatory compliance; production use requires a formal privacy, security, availability, backup, and legal review.

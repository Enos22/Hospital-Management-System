# User manual

## Start the local backend

From `HMS-Backend/server`, create a virtual environment, install `requirements.txt`, and run `python run.py`. The API listens on `http://127.0.0.1:5555`; `GET /health` returns the service status.

## Authenticate

Use `POST /api/auth/signup` to create a patient or doctor account, or `POST /api/auth/login` for an existing account. Include the returned token on protected requests:

```http
Authorization: Bearer <access_token>
```

Public signup cannot create an administrator. An existing administrator must provision staff accounts and roles.

## Common workflows

1. An administrator maintains users and pharmacy inventory.
2. A patient books an appointment using their patient profile ID and the selected doctor's profile ID.
3. A doctor creates a medical record, prescription, or laboratory request for the patient.
4. The patient can retrieve their own clinical data; requests for another patient's data are denied.
5. Billing staff create an invoice, record partial or full payments, and check balances/reports.
6. Users retrieve and mark their own notifications as read.

See the [API reference](./api_documentation.md) for request fields, role requirements, and endpoint paths. Use test data only in local development; do not put real patient information in development environments.

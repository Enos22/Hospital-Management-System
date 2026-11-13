# Project requirements

## Functional requirements

- Register and authenticate users using hashed passwords and JWT access tokens.
- Restrict administrative operations by role.
- Maintain patient, doctor, and specialty profiles.
- Book, list, update, and cancel appointments while rejecting overlapping doctor/patient slots.
- Create and retrieve patient medical records, prescriptions, laboratory requests, and results.
- Scope patient reads to the authenticated patient's own data; allow authorized doctor/admin access.
- Maintain medicine inventory and reject negative stock or price updates.
- Create invoices from line items, calculate tax/discount, record payments, and expose balances/reports.
- Deliver user-scoped notifications and track read status.
- Provide health check and JSON errors for invalid input and denied access.

## Non-functional requirements

- Keep secrets outside version control.
- Use migrations for schema changes and isolated databases for tests.
- Require least-privilege access to production health and financial data.
- Use TLS, backups, monitoring, and an appropriately managed database in production.
- Run the test suite before deploying.

These are project requirements, not a claim that every production-grade control is complete. See [deployment notes](./deployment.md) and [current model notes](./database_design.md).

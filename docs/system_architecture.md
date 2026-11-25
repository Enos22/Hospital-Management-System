# System architecture

AfyaCare is a Flask application organized into API routes, service functions, SQLAlchemy models, and Marshmallow schemas.

```text
React client / API consumer
        |
        | JSON + JWT Authorization header
        v
Flask app factory (CORS, JWT, SQLAlchemy, Flask-Migrate)
        |
        +-- Flask-RESTful resources and Flask blueprints
        |     auth, admin, doctors, patients, appointments,
        |     billing, pharmacy, laboratory, records,
        |     prescriptions, notifications
        +-- Services: billing, reporting, scheduling, matching,
        |             pharmacy, laboratory, medical records
        +-- Marshmallow schemas
        v
SQLAlchemy models -> SQLite by default; configurable SQL database
```

The app factory in `HMS-Backend/server/app/__init__.py` initializes extensions, imports all route modules explicitly, registers resources/blueprints, and creates the local schema. Import and registration failures propagate so startup does not silently omit routes.

JWT claims include the user's role. Protected handlers combine role checks with patient ownership checks where the API returns patient-specific data. Doctor and administrator roles have broader clinical access; patient tokens are scoped to the matching patient profile.

## Operational boundaries

- `run.py` is the local development entry point.
- `migrations/` contains the Alembic migration setup.
- `tests/` covers auth, role checks, route registration, billing/payment state, appointment conflicts, pharmacy stock, and clinical-data ownership.
- CORS origins currently target local development frontend ports and should be configured for deployment.
- Audit-log models exist, but centralized audit recording is not yet implemented for all mutations.

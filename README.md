# AfyaCare Hospital Management System

AfyaCare is a Flask REST API for core hospital operations: user authentication, patient and doctor directories, appointments, medical records, prescriptions, laboratory requests/results, pharmacy inventory, invoices, payments, reports, and notifications.

## Backend setup

Use Python 3.12 or newer. Commands below run from `HMS-Backend/server`:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python run.py
```

The development server listens on `http://127.0.0.1:5555`. The default SQLite database is `instance/afyacare.db`. Set `SECRET_KEY`, `JWT_SECRET_KEY`, and `DATABASE_URL` in the environment to override development defaults. Never use the development secret values in production.

Run the test suite from the same directory:

```bash
python -m pytest -q
```

For database migrations, use Flask-Migrate from the server directory:

```bash
flask --app app:create_app db upgrade
flask --app app:create_app db migrate -m "Describe the schema change"
```

## API and data

- API paths, methods, authentication, and request examples: [docs/api_documentation.md](./docs/api_documentation.md)
- Tables, foreign keys, and relationship overview: [docs/database_design.md](./docs/database_design.md)
- Deployment and production configuration: [docs/deployment.md](./docs/deployment.md)
- System architecture: [docs/system_architecture.md](./docs/system_architecture.md)
- User workflows: [docs/user_manual.md](./docs/user_manual.md)
- Project scope: [docs/project_proposal.md](./docs/project_proposal.md)
- Requirements: [docs/requirements.md](./docs/requirements.md)

Routes that expose patient-specific clinical, billing, appointment, or notification data enforce ownership for patient accounts; doctor/admin access is role-gated. Use a valid JWT in the `Authorization: Bearer <token>` header for protected endpoints.

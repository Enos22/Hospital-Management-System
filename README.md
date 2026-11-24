# AfyaCare Hospital Management System

AfyaCare is a full-stack hospital management application for coordinating clinical
and administrative workflows. The React frontend provides role-based portals for
administrators, doctors, and patients, while the Flask API manages authentication,
appointments, clinical records, prescriptions, laboratory work, pharmacy inventory,
billing, notifications, and reports.

## Highlights

- **Role-based portals** for administrators, doctors, and patients
- **Patient care workflows** for appointments, medical history, prescriptions, and laboratory tests
- **Clinical and pharmacy tools** for medical records and medicine inventory
- **Billing and reporting** for invoices, payments, balances, and operational reports
- **Secure API access** with JWT bearer authentication and role-aware routes
- **API documentation** through Swagger UI and an OpenAPI JSON document

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 19, React Router, TanStack Query, Vite |
| Backend | Python, Flask, Flask-RESTful, Flask-JWT-Extended |
| Data | SQLAlchemy, Flask-Migrate/Alembic |
| Database | PostgreSQL for development and production; SQLite is supported for local/testing use |
| Testing | Pytest |
| Deployment | Gunicorn, Render, and Vercel-compatible configuration |

## Repository layout

```text
.
├── FrontEnd/                 # React single-page application
│   ├── src/
│   └── vite.config.js
├── HMS-Backend/
│   └── server/
│       ├── app/              # Application factory, models, routes, and services
│       ├── migrations/       # Alembic database migrations
│       ├── tests/            # Backend test suite
│       └── run.py            # Local development entry point
└── docs/                     # Project requirements, design, API, and deployment guides
```

## Getting started

### Prerequisites

- Python 3.12 or newer
- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer (recommended for local development)

### 1. Start PostgreSQL

Create a local database:

```bash
createdb -U postgres afyacare
```

Update the database URL if your PostgreSQL credentials or host differ.

### 2. Configure and start the backend

```bash
cd HMS-Backend/server

python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

export DATABASE_URL="postgresql+psycopg://postgres@localhost:5432/afyacare"
export SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
export JWT_SECRET_KEY="$SECRET_KEY"

python run.py
```

The backend runs at `http://127.0.0.1:5555`.

- Health check: `http://127.0.0.1:5555/health`
- API root: `http://127.0.0.1:5555/`
- Swagger UI: `http://127.0.0.1:5555/api/docs`
- OpenAPI JSON: `http://127.0.0.1:5555/api/openapi.json`

Swagger UI is available automatically in debug mode. It can also be enabled with
`SWAGGER_UI_ENABLED=true`.

To use SQLite instead of PostgreSQL, set `DATABASE_URL` to a SQLite URL, for example:

```bash
export DATABASE_URL="sqlite:///afyacare.db"
```

SQLite is useful for quick local work and tests, but PostgreSQL is recommended for
a complete local environment.

### 3. Start the frontend

Open a second terminal:

```bash
cd FrontEnd
npm install

# For local backend use; omit this line only if you intentionally want another API
echo 'VITE_API_BASE_URL=http://127.0.0.1:5555' > .env

npm run dev
```

Open the Vite URL printed in the terminal, typically
`http://localhost:5173`.

## Environment variables

### Backend

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | No | SQLAlchemy database URL; defaults to the local PostgreSQL database |
| `SECRET_KEY` | Production | Flask signing and default JWT signing key |
| `JWT_SECRET_KEY` | Production | Separate JWT signing key |
| `FLASK_DEBUG` | No | Enables Flask debug mode with `1`, `true`, or `yes` |
| `SWAGGER_UI_ENABLED` | No | Enables Swagger UI outside debug mode |

Never commit real secrets or database credentials.

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL used for backend API requests |

## Database migrations

Run migration commands from `HMS-Backend/server`:

```bash
flask --app app:create_app db upgrade
flask --app app:create_app db migrate -m "Describe the schema change"
```

Review generated migration files before applying or committing them.

## Tests

Run the backend test suite from `HMS-Backend/server`:

```bash
python -m pytest -q
```

Tests use an isolated database configuration and do not depend on the local
application database.

Build the frontend:

```bash
cd FrontEnd
npm run build
```

## API authentication

Protected endpoints require a JWT bearer token:

```http
Authorization: Bearer <access_token>
```
SYSTEM STRUCTURE 
[![Architecture diagram of enos22/hospital-management-system](https://gitdiagram.com/enos22/hospital-management-system/diagram.png)](https://gitdiagram.com/enos22/hospital-management-system?utm_source=readme&utm_medium=picture)

Obtain a token through the authentication endpoints documented in the API guide.
Patient-specific routes are ownership-aware, while administrative and clinical
operations are restricted to authorized roles.

## Documentation

- [API documentation](./docs/api_documentation.md)
- [Database design](./docs/database_design.md)
- [System architecture](./docs/system_architecture.md)
- [User manual](./docs/user_manual.md)
- [Requirements](./docs/requirements.md)
- [Project proposal](./docs/project_proposal.md)
- [Deployment guide](./docs/deployment.md)

## Security

- Do not use development credentials or example passwords in production.
- Store secrets through environment variables or a managed secret store.
- Restrict database and application access to authorized services and users.
- Back up databases that contain patient, identity, billing, or payment data.
- Apply migrations deliberately before starting production traffic.

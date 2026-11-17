# AfyaCare backend

This directory contains the Flask application, SQLAlchemy models, REST routes, services, migrations, seed data, and pytest suite.

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python run.py
```

The development server runs on `http://127.0.0.1:5555`. `GET /health` checks that the application is responding. PostgreSQL is the default database (`postgresql+psycopg://postgres@localhost:5432/afyacare`).

Create the PostgreSQL database before starting the server:

```bash
createdb -U postgres afyacare
```

If your PostgreSQL username, password, host, or port differ, set `DATABASE_URL` in the server `.env` file or in your shell:

```bash
export DATABASE_URL="postgresql+psycopg://USER:PASSWORD@localhost:5432/afyacare"
python run.py
```

The backend also accepts `postgresql://` and legacy `postgres://` URLs and uses the installed Psycopg 3 driver. URL-encode special characters in the username or password. The app creates missing tables on startup. Switching databases does not copy records from the old SQLite file; back up and migrate any data you need to keep before switching.

Configuration variables:

| Variable | Purpose | Local default |
|---|---|---|
| `SECRET_KEY` | Flask signing key | Development-only value |
| `JWT_SECRET_KEY` | JWT signing key | `SECRET_KEY` |
| `DATABASE_URL` | PostgreSQL SQLAlchemy URL | `postgresql+psycopg://postgres@localhost:5432/afyacare` |

Set strong, distinct secret values outside source control for any deployed environment. `python run.py` is for local development; see [deployment instructions](../../docs/deployment.md) for a production WSGI server.

## Tests and migrations

```bash
python -m pytest -q
flask --app app:create_app db upgrade
flask --app app:create_app db migrate -m "Describe the schema change"
```

Tests continue to use an isolated in-memory SQLite database. Add regression tests for new routes and business rules.

## Source layout

- `app/routes/`: Flask-RESTful resources and Flask blueprints
- `app/services/`: scheduling, billing, reporting, matching, pharmacy, laboratory, and record operations
- `app/models/`: SQLAlchemy models
- `app/schemas/`: Marshmallow serialization and validation
- `migrations/`: Alembic migration history
- `tests/`: API, access-control, and business-rule tests

See the repository [API reference](../../docs/api_documentation.md) and [database design](../../docs/database_design.md).

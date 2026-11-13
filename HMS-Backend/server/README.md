# AfyaCare backend

This directory contains the Flask application, SQLAlchemy models, REST routes, services, migrations, seed data, and pytest suite.

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python run.py
```

The development server runs on `http://127.0.0.1:5555`. `GET /health` checks that the application is responding. By default, data is stored in `instance/afyacare.db`.

Configuration variables:

| Variable | Purpose | Local default |
|---|---|---|
| `SECRET_KEY` | Flask signing key | Development-only value |
| `JWT_SECRET_KEY` | JWT signing key | `SECRET_KEY` |
| `DATABASE_URL` | SQLAlchemy database URL | `sqlite:///afyacare.db` |

Set strong, distinct secret values outside source control for any deployed environment. `python run.py` is for local development; see [deployment instructions](../../docs/deployment.md) for a production WSGI server.

## Tests and migrations

```bash
python -m pytest -q
flask --app app:create_app db upgrade
flask --app app:create_app db migrate -m "Describe the schema change"
```

Tests use an isolated in-memory SQLite database. Add regression tests for new routes and business rules.

## Source layout

- `app/routes/`: Flask-RESTful resources and Flask blueprints
- `app/services/`: scheduling, billing, reporting, matching, pharmacy, laboratory, and record operations
- `app/models/`: SQLAlchemy models
- `app/schemas/`: Marshmallow serialization and validation
- `migrations/`: Alembic migration history
- `tests/`: API, access-control, and business-rule tests

See the repository [API reference](../../docs/api_documentation.md) and [database design](../../docs/database_design.md).

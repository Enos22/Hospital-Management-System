# Deployment instructions

## Prepare the environment

Use a supported Python runtime and install the backend dependencies:

```bash
cd HMS-Backend/server
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Provide secrets and a production database URL through the deployment platform's secret/configuration store. Do not commit `.env` files or production credentials.

```bash
export SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
export JWT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
export DATABASE_URL="postgresql+psycopg://user:password@db-host:5432/afyacare"
```

Install the matching database driver if the selected database URL requires one. For local development, omit `DATABASE_URL` to use SQLite.

## Apply schema and start

Review and apply migrations before serving traffic:

```bash
flask --app app:create_app db upgrade
gunicorn --bind 0.0.0.0:8000 run:app
```

`python run.py` runs the local development server on `127.0.0.1:5555`; it is not the production server. Place the WSGI process behind a TLS-terminating reverse proxy or managed ingress, restrict inbound access, and use a managed database with backups.

## Operational checks

- Request `GET /health` after deployment.
- Run `python -m pytest -q` in CI before release.
- Confirm that production secrets are strong, distinct, and rotated when required.
- Configure CORS to only the deployed frontend origin; the current allowlist is for local development.
- Apply schema changes using reviewed Alembic migrations.
- Back up and restrict access to databases containing medical, identity, or payment data.
- Monitor application errors and failed migrations; do not treat startup success as a health check for database readiness.

The application currently calls `db.create_all()` during startup for convenience. Before operating a production deployment, remove that convenience behavior in favor of a migration-only release process and verify database permissions and migration rollback procedures.

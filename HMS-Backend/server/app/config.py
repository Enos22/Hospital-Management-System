import os
from pathlib import Path

from dotenv import load_dotenv

# Only load .env locally. Never override Render's real env vars.
load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

def get_database_uri():
    database_uri = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres@localhost:5432/afyacare",
    )

    if database_uri.startswith("postgres://"):
        return database_uri.replace("postgres://", "postgresql+psycopg://", 1)
    if database_uri.startswith("postgresql://"):
        return database_uri.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_uri

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    DEBUG = os.getenv("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    SWAGGER_UI_ENABLED = (
        os.getenv("SWAGGER_UI_ENABLED", "").lower() in {"1", "true", "yes", "on"}
        if "SWAGGER_UI_ENABLED" in os.environ
        else None
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
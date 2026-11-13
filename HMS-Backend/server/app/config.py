import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///afyacare.db")
    DEBUG = os.getenv("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}

    SQLALCHEMY_TRACK_MODIFICATIONS = False
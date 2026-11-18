from getpass import getpass
import os
from urllib.parse import urlparse

from sqlalchemy.exc import IntegrityError


def create_admin_user(app, username: str, email: str, password: str) -> int:
    from app.extensions import db
    from app.models.user import User

    with app.app_context():
        if User.query.filter_by(username=username).first():
            raise ValueError("That username already exists.")
        if User.query.filter_by(email=email).first():
            raise ValueError("That email already exists.")

        user = User(username=username, email=email, role="admin")
        user.password = password
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError as error:
            db.session.rollback()
            raise ValueError(
                "The username or email was created concurrently; choose another."
            ) from error
        return user.id


def main() -> None:
    database_url = getpass("Render external database URL (hidden): ").strip()
    parsed_url = urlparse(database_url)
    if parsed_url.scheme not in {"postgres", "postgresql", "postgresql+psycopg"}:
        raise SystemExit("Enter a valid PostgreSQL connection URL.")
    if not parsed_url.hostname or not parsed_url.path.strip("/"):
        raise SystemExit("The database URL must include a host and database name.")

    os.environ["DATABASE_URL"] = database_url

    username = input("New admin username: ").strip()
    email = input("New admin email: ").strip()
    password = getpass("New admin password (at least 12 characters): ")
    confirmation = getpass("Confirm new admin password: ")

    if not username or len(username) > 50:
        raise SystemExit("Username must contain between 1 and 50 characters.")
    if not email or len(email) > 100 or "@" not in email:
        raise SystemExit("Enter a valid email address (maximum 100 characters).")
    if len(password) < 12:
        raise SystemExit("The password must contain at least 12 characters.")
    if password != confirmation:
        raise SystemExit("The passwords do not match.")

    host = parsed_url.hostname
    database = parsed_url.path.strip("/")
    print(f"Creating admin in PostgreSQL database {database!r} on {host!r}.")
    if input("Type CREATE ADMIN to confirm: ").strip() != "CREATE ADMIN":
        raise SystemExit("Cancelled.")

    from app import create_app

    app = create_app()
    user_id = create_admin_user(app, username, email, password)
    print(f"Admin account created (user id {user_id}).")


if __name__ == "__main__":
    main()

import pytest

from app.extensions import db
from app.models.user import User
from create_admin import create_admin_user


def test_create_admin_user_creates_admin_without_storing_plaintext(app):
    user_id = create_admin_user(
        app, "new-admin", "new-admin@example.com", "Long-test-password-123"
    )

    user = db.session.get(User, user_id)
    assert user is not None
    assert user.role == "admin"
    assert user.authenticated("Long-test-password-123")
    assert user.password_hash != "Long-test-password-123"


@pytest.mark.parametrize(
    ("username", "email"),
    [
        ("existing-user", "another@example.com"),
        ("another-user", "existing@example.com"),
    ],
)
def test_create_admin_user_rejects_duplicate_username_or_email(
    app, make_user, username, email
):
    make_user("patient", username="existing-user", email="existing@example.com")

    with pytest.raises(ValueError, match="already exists"):
        create_admin_user(app, username, email, "Long-test-password-123")

    assert User.query.filter_by(role="admin").count() == 0

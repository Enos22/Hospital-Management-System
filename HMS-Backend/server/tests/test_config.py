import pytest

from app.config import get_database_uri


def test_database_uri_defaults_to_local_postgresql(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)

    assert get_database_uri() == (
        "postgresql+psycopg://postgres@localhost:5432/afyacare"
    )


@pytest.mark.parametrize(
    ("database_url", "expected_url"),
    [
        (
            "postgresql://user:password@localhost/afyacare",
            "postgresql+psycopg://user:password@localhost/afyacare",
        ),
        (
            "postgres://user:password@localhost/afyacare",
            "postgresql+psycopg://user:password@localhost/afyacare",
        ),
        ("sqlite:///test.db", "sqlite:///test.db"),
    ],
)
def test_database_uri_preserves_configured_database(
    monkeypatch, database_url, expected_url
):
    monkeypatch.setenv("DATABASE_URL", database_url)

    assert get_database_uri() == expected_url

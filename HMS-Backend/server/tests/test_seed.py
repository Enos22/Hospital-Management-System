import pytest
import seed
from app.models import (
    AuditLog,
    Doctor,
    Invoice,
    InvoiceItem,
    LabRequest,
    LabResult,
    MedicalRecord,
    Medicine,
    Notification,
    Patient,
    Payment,
    Prescription,
    Speciality,
    User,
)


def test_seed_database_creates_complete_repeatable_data(app, monkeypatch):
    monkeypatch.setattr(seed, "app", app)

    seed.seed_database()
    models = (
        User,
        Patient,
        Doctor,
        Speciality,
        Medicine,
        Payment,
        Notification,
        Prescription,
        MedicalRecord,
        LabResult,
        LabRequest,
        Invoice,
        InvoiceItem,
        AuditLog,
    )
    first_counts = {model.__tablename__: model.query.count() for model in models}

    assert first_counts["patients"] == 4
    assert first_counts["doctors"] == 4
    assert first_counts["invoice_items"] == 3
    assert first_counts["invoices"] == 3
    assert all(
        user.patient is not None
        for user in User.query.filter_by(role="patient").all()
    )
    assert all(
        user.doctor is not None
        for user in User.query.filter_by(role="doctor").all()
    )

    invoice = Invoice.query.filter_by(status="partial").one()
    assert invoice.amount_paid == 1000
    assert sum(item.line_total for item in invoice.items) == invoice.total_amount
    assert sum(payment.amount for payment in invoice.payments) == invoice.amount_paid

    seed.seed_database()
    second_counts = {model.__tablename__: model.query.count() for model in models}
    assert second_counts == first_counts


def test_seed_data_uses_all_seed_users(app, monkeypatch):
    monkeypatch.setattr(seed, "app", app)

    assert seed.seed_data() == len(seed.SEED_USERS)
    assert seed.seed_data() == 0
    assert User.query.filter_by(role="billing").one().email == "billing@afyacare.com"


def test_seed_database_reraises_seed_failures(app, monkeypatch):
    monkeypatch.setattr(seed, "app", app)

    def fail_seed_users():
        raise RuntimeError("seed users failed")

    monkeypatch.setattr(seed, "seed_users", fail_seed_users)
    with pytest.raises(RuntimeError, match="seed users failed"):
        seed.seed_database()

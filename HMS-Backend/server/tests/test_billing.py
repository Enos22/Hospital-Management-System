def test_invoice_payment_transitions_and_owner_access(client, app, make_user, token_for):
    from app.extensions import db
    from app.models.invoice import Invoice

    admin, _ = make_user("admin")
    patient_user, patient = make_user("patient", username="billing-patient")
    other_user, _ = make_user("patient", username="other-patient")

    admin_headers = {"Authorization": f"Bearer {token_for(admin)}"}
    invoice_response = client.post(
        "/api/billing/invoices",
        headers=admin_headers,
        json={
            "patient_id": patient.id,
            "items": [
                {"description": "Consultation", "quantity": 1, "unit_price": 1000}
            ],
            "tax_rate": 10,
            "discount": 0,
        },
    )
    assert invoice_response.status_code == 201
    invoice_data = invoice_response.get_json()["data"]
    invoice_id = invoice_data["id"]
    assert invoice_data["total_amount"] == 1100

    patient_headers = {"Authorization": f"Bearer {token_for(patient_user)}"}
    owner_view = client.get(
        f"/api/billing/invoices/{invoice_id}", headers=patient_headers
    )
    assert owner_view.status_code == 200
    assert owner_view.get_json()["data"]["patient_id"] == patient.id

    other_headers = {"Authorization": f"Bearer {token_for(other_user)}"}
    denied_view = client.get(
        f"/api/billing/invoices/{invoice_id}", headers=other_headers
    )
    assert denied_view.status_code == 403

    partial = client.post(
        f"/api/billing/invoices/{invoice_id}/payments",
        headers=admin_headers,
        json={"amount": 400, "method": "cash"},
    )
    assert partial.status_code == 201
    assert partial.get_json()["data"]["status"] == "partial"

    paid = client.post(
        f"/api/billing/invoices/{invoice_id}/payments",
        headers=admin_headers,
        json={"amount": 700, "method": "mobile_money"},
    )
    assert paid.status_code == 201
    assert paid.get_json()["data"]["status"] == "paid"

    overpayment = client.post(
        f"/api/billing/invoices/{invoice_id}/payments",
        headers=admin_headers,
        json={"amount": 1, "method": "cash"},
    )
    assert overpayment.status_code == 400

    with app.app_context():
        invoice = db.session.get(Invoice, invoice_id)
        assert invoice.amount_paid == 1100
        assert invoice.status == "paid"


def test_unpaid_invoice_can_be_cancelled_but_paid_invoice_cannot(
    client, make_user, token_for
):
    admin, _ = make_user("admin")
    _, patient = make_user("patient", username="cancel-patient")
    headers = {"Authorization": f"Bearer {token_for(admin)}"}

    response = client.post(
        "/api/billing/invoices",
        headers=headers,
        json={
            "patient_id": patient.id,
            "items": [{"description": "Test", "quantity": 1, "unit_price": 50}],
        },
    )
    invoice_id = response.get_json()["data"]["id"]
    cancelled = client.post(
        f"/api/billing/invoices/{invoice_id}/cancel", headers=headers
    )
    assert cancelled.status_code == 200
    assert cancelled.get_json()["data"]["status"] == "cancelled"


def test_patient_cannot_create_invoice(client, make_user, token_for):
    patient_user, patient = make_user("patient", username="no-billing")
    response = client.post(
        "/api/billing/invoices",
        headers={"Authorization": f"Bearer {token_for(patient_user)}"},
        json={
            "patient_id": patient.id,
            "items": [{"description": "Test", "quantity": 1, "unit_price": 10}],
        },
    )
    assert response.status_code == 403
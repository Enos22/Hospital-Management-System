from app.extensions import db
from app.models.notification import Notification
from app.models.user import User


def test_admin_routes_enforce_roles_and_paginate(client, make_user, token_for):
    admin, _ = make_user("admin")
    patient, _ = make_user("patient", username="page-patient")

    assert client.get("/api/admin/dashboard").status_code == 401

    patient_token = token_for(patient)
    forbidden = client.get(
        "/api/admin/dashboard",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert forbidden.status_code == 403

    admin_token = token_for(admin)
    headers = {"Authorization": f"Bearer {admin_token}"}
    dashboard = client.get("/api/admin/dashboard", headers=headers)
    assert dashboard.status_code == 200
    assert dashboard.get_json()["total_users"] == 2

    users = client.get("/api/admin/users?per_page=1", headers=headers)
    assert users.status_code == 200
    assert users.get_json()["total"] == 2
    assert users.get_json()["per_page"] == 1


def test_admin_cannot_demote_or_delete_self(client, make_user, token_for):
    admin, _ = make_user("admin")
    token = token_for(admin)
    headers = {"Authorization": f"Bearer {token}"}

    demote = client.patch(
        f"/api/admin/users/{admin.id}",
        json={"role": "patient"},
        headers=headers,
    )
    assert demote.status_code == 403

    delete = client.delete(f"/api/admin/users/{admin.id}", headers=headers)
    assert delete.status_code == 403


def test_admin_can_delete_unlinked_user_and_notifications(
    app, client, make_user, token_for
):
    admin, _ = make_user("admin")
    unlinked_user, _ = make_user("billing", username="unlinked-billing-user")
    db.session.add(
        Notification(user_id=unlinked_user.id, message="Account notification")
    )
    db.session.commit()
    user_id = unlinked_user.id
    headers = {"Authorization": f"Bearer {token_for(admin)}"}

    response = client.delete(f"/api/admin/users/{user_id}", headers=headers)

    assert response.status_code == 204
    with app.app_context():
        assert db.session.get(User, user_id) is None
        assert Notification.query.filter_by(user_id=user_id).count() == 0


def test_admin_cannot_delete_user_linked_to_profile(client, make_user, token_for):
    admin, _ = make_user("admin")
    patient, _ = make_user("patient", username="linked-patient-user")
    headers = {"Authorization": f"Bearer {token_for(admin)}"}

    response = client.delete(f"/api/admin/users/{patient.id}", headers=headers)

    assert response.status_code == 409
    assert "linked to a doctor or patient profile" in response.get_json()["errors"][0]
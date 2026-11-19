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
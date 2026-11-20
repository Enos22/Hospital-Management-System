def test_all_route_modules_are_registered(app):
    paths = {rule.rule for rule in app.url_map.iter_rules()}
    expected = {
        "/api/auth/signup",
        "/api/admin/dashboard",
        "/api/doctors",
        "/api/patients",
        "/api/appointments",
        "/api/billing/invoices",
        "/api/pharmacy/medicines",
        "/api/laboratory/tests",
        "/api/medical-records",
        "/api/prescriptions",
        "/api/notifications/<int:user_id>",
    }
    assert expected <= paths


def test_protected_endpoints_require_authentication(client):
    for path in (
        "/api/admin/dashboard",
        "/api/pharmacy/medicines",
        "/api/laboratory/tests",
        "/api/medical-records",
        "/api/prescriptions",
        "/api/billing/invoices",
    ):
        response = client.get(path)
        assert response.status_code == 401, path


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"
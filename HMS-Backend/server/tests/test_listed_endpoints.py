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


def test_reported_protected_routes_return_401_without_a_token(client):
    requests = (
        ("GET", "/api/admin/dashboard"),
        ("GET", "/api/admin/users"),
        ("PATCH", "/api/admin/users/1"),
        ("DELETE", "/api/admin/users/1"),
        ("GET", "/api/auth/checksession"),
        ("POST", "/api/doctors"),
        ("GET", "/api/doctors"),
        ("GET", "/api/doctors/1"),
        ("PATCH", "/api/doctors/1"),
        ("DELETE", "/api/doctors/1"),
        ("POST", "/api/laboratory/tests"),
        ("GET", "/api/laboratory/tests"),
        ("GET", "/api/laboratory/tests/1"),
        ("PATCH", "/api/laboratory/tests/1"),
        ("POST", "/api/medical-records"),
        ("GET", "/api/medical-records"),
        ("GET", "/api/medical-records/1"),
        ("PATCH", "/api/medical-records/1"),
        ("DELETE", "/api/medical-records/1"),
        ("POST", "/api/patients"),
        ("GET", "/api/patients"),
        ("GET", "/api/patients/1"),
        ("PATCH", "/api/patients/1"),
        ("DELETE", "/api/patients/1"),
        ("GET", "/api/patients/1/medical-history"),
        ("POST", "/api/pharmacy/medicines"),
        ("GET", "/api/pharmacy/medicines"),
        ("GET", "/api/pharmacy/medicines/1"),
        ("PATCH", "/api/pharmacy/medicines/1"),
        ("DELETE", "/api/pharmacy/medicines/1"),
        ("POST", "/api/prescriptions"),
        ("GET", "/api/prescriptions"),
        ("GET", "/api/prescriptions/1"),
        ("PATCH", "/api/prescriptions/1"),
        ("DELETE", "/api/prescriptions/1"),
    )

    for method, path in requests:
        response = client.open(path, method=method)
        assert response.status_code == 401, (
            f"{method} {path}: {response.get_data(as_text=True)}"
        )


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"
def test_signup_login_and_checksession(client):
    signup = client.post(
        "/api/auth/signup",
        json={
            "username": "new-patient",
            "email": "new-patient@example.com",
            "password": "secure-password",
            "password_confirmation": "secure-password",
        },
    )
    assert signup.status_code == 201
    token = signup.get_json()["access_token"]

    checksession = client.get(
        "/api/auth/checksession",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert checksession.status_code == 200
    assert checksession.get_json()["username"] == "new-patient"

    login = client.post(
        "/api/auth/login",
        json={"username": "new-patient", "password": "secure-password"},
    )
    assert login.status_code == 200
    assert "access_token" in login.get_json()

    invalid_login = client.post(
        "/api/auth/login",
        json={"username": "new-patient", "password": "incorrect"},
    )
    assert invalid_login.status_code == 401


def test_signup_rejects_admin_and_password_mismatch(client):
    mismatch = client.post(
        "/api/auth/signup",
        json={
            "username": "mismatch",
            "email": "mismatch@example.com",
            "password": "secure-password",
            "password_confirmation": "different-password",
        },
    )
    assert mismatch.status_code == 422

    admin = client.post(
        "/api/auth/signup",
        json={
            "username": "public-admin",
            "email": "public-admin@example.com",
            "password": "secure-password",
            "password_confirmation": "secure-password",
            "role": "admin",
        },
    )
    assert admin.status_code == 403
from app import create_app


def test_swagger_ui_and_openapi_document_are_available_in_testing(client):
    docs_response = client.get("/api/docs")
    spec_response = client.get("/api/openapi.json")

    assert docs_response.status_code == 200
    assert b"swagger-ui-bundle.js" in docs_response.data
    assert spec_response.status_code == 200

    spec = spec_response.get_json()
    assert spec["openapi"] == "3.0.3"
    assert spec["servers"] == [{"url": "/"}]
    assert "BearerAuth" in spec["components"]["securitySchemes"]
    assert "post" in spec["paths"]["/api/auth/login"]
    assert "security" not in spec["paths"]["/api/auth/login"]["post"]
    assert spec["paths"]["/api/doctors/{id}"]["get"]["security"] == [
        {"BearerAuth": []}
    ]
    assert spec["paths"]["/api/doctors/{id}"]["get"]["parameters"] == [
        {
            "name": "id",
            "in": "path",
            "required": True,
            "schema": {"type": "integer", "format": "int32"},
        }
    ]
    signup_body = spec["paths"]["/api/auth/signup"]["post"]["requestBody"]
    signup_schema = signup_body["content"]["application/json"]["schema"]
    assert signup_schema["required"] == [
        "username",
        "email",
        "password",
        "password_confirmation",
    ]
    assert signup_schema["properties"]["role"]["enum"] == ["patient", "doctor"]
    assert "must be unique" in spec["paths"]["/api/auth/signup"]["post"][
        "description"
    ]
    assert signup_body["content"]["application/json"]["example"] == {
        "username": "your-username",
        "email": "you@example.com",
        "password": "choose-a-password",
        "password_confirmation": "choose-a-password",
        "role": "patient",
    }

    login_schema = (
        spec["paths"]["/api/auth/login"]["post"]["requestBody"]["content"][
            "application/json"
        ]["schema"]
    )
    assert login_schema["required"] == ["username", "password"]


def test_swagger_can_be_disabled():
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "JWT_SECRET_KEY": "test-secret-key-with-at-least-32-bytes",
            "SWAGGER_UI_ENABLED": False,
        }
    )
    client = app.test_client()

    assert client.get("/api/docs").status_code == 404
    assert client.get("/api/openapi.json").status_code == 404
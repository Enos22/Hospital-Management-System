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
    assert "requestBody" in spec["paths"]["/api/auth/signup"]["post"]


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
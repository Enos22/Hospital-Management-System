import json

from app.services.ai_faq_service import AIProviderError, answer_faq_question


def test_faq_requires_patient_role(client, make_user, token_for):
    doctor, _ = make_user(role="doctor")
    response = client.post(
        "/api/ai/faq",
        json={"question": "How do I book an appointment?"},
        headers={"Authorization": f"Bearer {token_for(doctor)}"},
    )

    assert response.status_code == 403


def test_faq_rejects_invalid_questions(client, make_user, token_for):
    patient, _ = make_user()
    headers = {"Authorization": f"Bearer {token_for(patient)}"}

    empty_response = client.post("/api/ai/faq", json={"question": " "}, headers=headers)
    long_response = client.post(
        "/api/ai/faq",
        json={"question": "a" * 501},
        headers=headers,
    )

    assert empty_response.status_code == 422
    assert long_response.status_code == 422


def test_faq_returns_answer(client, make_user, token_for, app, monkeypatch):
    patient, _ = make_user()
    app.config["OPENAI_API_KEY"] = "test-key"

    def fake_answer(question):
        assert question == "How do I book an appointment?"
        return "Open the appointments section and choose Book an Appointment."

    monkeypatch.setattr("app.routes.ai_routes.answer_faq_question", fake_answer)
    response = client.post(
        "/api/ai/faq",
        json={"question": " How do I book an appointment? "},
        headers={"Authorization": f"Bearer {token_for(patient)}"},
    )

    assert response.status_code == 200
    assert response.get_json() == {
        "answer": "Open the appointments section and choose Book an Appointment."
    }


def test_faq_reports_missing_provider_configuration(
    client, make_user, token_for, app
):
    patient, _ = make_user()
    app.config["OPENAI_API_KEY"] = None
    response = client.post(
        "/api/ai/faq",
        json={"question": "How do I book an appointment?"},
        headers={"Authorization": f"Bearer {token_for(patient)}"},
    )

    assert response.status_code == 503
    assert response.get_json()["errors"] == [
        "The FAQ assistant is not configured"
    ]


def test_faq_reports_provider_failure(client, make_user, token_for, app, monkeypatch):
    patient, _ = make_user()
    app.config["OPENAI_API_KEY"] = "test-key"

    def fail_answer(question):
        raise AIProviderError

    monkeypatch.setattr("app.routes.ai_routes.answer_faq_question", fail_answer)
    response = client.post(
        "/api/ai/faq",
        json={"question": "How do I book an appointment?"},
        headers={"Authorization": f"Bearer {token_for(patient)}"},
    )

    assert response.status_code == 502
    assert response.get_json()["errors"] == [
        "The FAQ assistant is temporarily unavailable"
    ]


def test_faq_service_sends_question_to_configured_provider(app, monkeypatch):
    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def read(self):
            return json.dumps(
                {"choices": [{"message": {"content": "Use the Book Appointment page."}}]}
            ).encode()

    def fake_urlopen(request, timeout):
        assert request.full_url == "https://api.openai.com/v1/chat/completions"
        assert request.get_header("Authorization") == "Bearer test-key"
        assert timeout == 20
        payload = json.loads(request.data)
        assert payload["messages"][-1] == {
            "role": "user",
            "content": "How do I book an appointment?",
        }
        return FakeResponse()

    app.config["OPENAI_API_KEY"] = "test-key"
    monkeypatch.setattr("app.services.ai_faq_service.urlopen", fake_urlopen)

    with app.app_context():
        answer = answer_faq_question("How do I book an appointment?")

    assert answer == "Use the Book Appointment page."

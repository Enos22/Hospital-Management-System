import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from flask import current_app


class AIProviderNotConfigured(Exception):
    pass


class AIProviderError(Exception):
    pass


def answer_faq_question(question):
    api_key = current_app.config.get("OPENAI_API_KEY")
    if not api_key:
        raise AIProviderNotConfigured

    payload = {
        "model": current_app.config.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are AfyaCare's patient FAQ assistant. Answer only general "
                    "questions about using a hospital portal and administrative "
                    "workflows such as appointments, billing, laboratory results, "
                    "and prescriptions. The patient portal includes pages named "
                    "Book an Appointment, Appointments, Medical History, "
                    "Prescriptions, Laboratory, and Bills. Use these names when "
                    "helpful. Do not claim to know AfyaCare-specific policies or "
                    "details beyond this information. Do not give medical "
                    "advice, diagnosis, treatment, or medication recommendations. "
                    "For health concerns, direct the user to a qualified clinician; "
                    "for emergencies, direct them to local emergency services. "
                    "Keep answers concise and state when you do not know."
                ),
            },
            {"role": "user", "content": question},
        ],
        "temperature": 0.2,
        "max_tokens": 250,
    }
    request = Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        current_app.logger.warning(
            "FAQ AI provider returned HTTP status %s", error.code
        )
        raise AIProviderError from error
    except (URLError, TimeoutError, json.JSONDecodeError, UnicodeDecodeError) as error:
        current_app.logger.warning("FAQ AI provider request failed")
        raise AIProviderError from error

    try:
        answer = result["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, AttributeError, TypeError) as error:
        current_app.logger.warning("FAQ AI provider returned an invalid response")
        raise AIProviderError from error

    if not answer:
        current_app.logger.warning("FAQ AI provider returned an empty answer")
        raise AIProviderError

    return answer

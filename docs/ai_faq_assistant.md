# Patient FAQ assistant

AfyaCare includes an AI-assisted FAQ on the patient dashboard. It is intended
for general help using the portal, such as finding appointment, billing,
laboratory, and prescription pages. It is not a clinical decision-support tool.

## What is implemented

- The React patient dashboard renders the FAQ assistant and keeps the visible
  conversation in page memory only.
- The frontend sends each question to `POST /api/ai/faq`. Each request contains
  only the current question; previous messages and patient/account records are
  not sent.
- The Flask endpoint requires a patient JWT, trims and validates the question,
  and limits it to 500 characters.
- The backend calls OpenAI's Chat Completions API using a server-side API key.
  The system instructions limit responses to general portal workflows, use
  known patient portal page names, and prohibit medical advice, diagnosis, and
  treatment recommendations.
- AfyaCare does not persist the questions or answers. A missing API key returns
  `503`; upstream provider failures return `502`.

## Configure the provider

Set these variables in the backend process environment or deployment secret
store:

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes, to enable the assistant | Unset | Server-side OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Chat Completions model |

For local development, set `OPENAI_API_KEY` in the backend environment before
starting Flask. Never put this key in a `VITE_` variable, frontend `.env` file,
or source control. Without a configured key, the endpoint responds that the
assistant is not configured.

## API

```http
POST /api/ai/faq
Authorization: Bearer <patient-access-token>
Content-Type: application/json
```

Request:

```json
{
  "question": "How do I book an appointment?"
}
```

Successful response:

```json
{
  "answer": "Open Book an Appointment in the patient portal to get started."
}
```

The endpoint is patient-only. It returns `401` when authentication is missing
or invalid, `403` for non-patient roles, `422` for a missing or overlong
question, `503` when `OPENAI_API_KEY` is not configured, and `502` if the
provider request fails. See the [API reference](./api_documentation.md#ai-faq-assistant).

## Privacy and safety

Questions are sent to OpenAI for processing. AfyaCare does not send account
identifiers, conversation history, or patient records, and does not store the
conversation. Provider processing is separate from AfyaCare storage; review the
provider's current data-handling terms before deployment. The interface tells
users not to enter medical details or other private information.

The assistant can still make mistakes. It must not be used for symptoms,
diagnosis, medication, treatment, or emergencies. Users should consult a
qualified clinician for health concerns and local emergency services for
emergencies.

## Verification

The backend tests cover patient-only access, request validation, provider
configuration and failure responses, provider request construction, and API
documentation. The frontend is verified with the production Vite build.

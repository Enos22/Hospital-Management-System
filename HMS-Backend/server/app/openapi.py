import re

from flask import Flask, jsonify, render_template
from werkzeug.routing import Rule


_PATH_PARAMETER = re.compile(r"<(?:(?P<converter>[^:<>]+):)?(?P<name>[^<>]+)>")
_HTTP_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}
_PUBLIC_API_PATHS = {
    "/api/auth/signup",
    "/api/auth/login",
    "/api/auth/logout",
}
_OPERATION_DETAILS = {
    ("POST", "/api/auth/signup"): {
        "summary": "Register a new patient or doctor",
        "description": (
            "Username and email must be unique. For an existing account, use "
            "POST /api/auth/login instead."
        ),
    },
    ("GET", "/"): {
        "description": "Intentionally public backend service information.",
    },
    ("GET", "/health"): {
        "description": "Intentionally public health check used by hosting probes.",
    },
}
_REQUEST_BODIES = {
    ("POST", "/api/auth/signup"): {
        "required": ["username", "email", "password", "password_confirmation"],
        "properties": {
            "username": {"type": "string", "maxLength": 50},
            "email": {"type": "string", "format": "email", "maxLength": 100},
            "password": {"type": "string", "minLength": 1},
            "password_confirmation": {"type": "string", "minLength": 1},
            "role": {
                "type": "string",
                "enum": ["patient", "doctor"],
                "default": "patient",
            },
        },
        "example": {
            "username": "your-username",
            "email": "you@example.com",
            "password": "choose-a-password",
            "password_confirmation": "choose-a-password",
            "role": "patient",
        },
    },
    ("POST", "/api/auth/login"): {
        "required": ["username", "password"],
        "properties": {
            "username": {"type": "string"},
            "password": {"type": "string"},
        },
        "example": {"username": "your-username", "password": "your-password"},
    },
}


def _openapi_path(rule: Rule) -> str:
    return _PATH_PARAMETER.sub(
        lambda match: "{" + match.group("name") + "}", rule.rule
    )


def _path_parameters(rule: Rule) -> list[dict]:
    parameters = []
    for match in _PATH_PARAMETER.finditer(rule.rule):
        converter = match.group("converter") or "string"
        schema = {
            "type": {
                "int": "integer",
                "float": "number",
                "uuid": "string",
                "string": "string",
                "path": "string",
            }.get(converter, "string")
        }
        if converter == "int":
            schema["format"] = "int32"
        elif converter == "float":
            schema["format"] = "float"
        elif converter == "uuid":
            schema["format"] = "uuid"
        parameters.append(
            {
                "name": match.group("name"),
                "in": "path",
                "required": True,
                "schema": schema,
            }
        )
    return parameters


def _tag_for_path(path: str) -> str:
    parts = [part for part in path.split("/") if part and part != "api"]
    return parts[0].replace("-", " ").title() if parts else "General"


def create_openapi_spec(app: Flask) -> dict:
    paths = {}
    for rule in app.url_map.iter_rules():
        if rule.endpoint in {"static", "swagger_ui", "openapi_json"}:
            continue

        path = _openapi_path(rule)
        if not (path.startswith("/api/") or path in {"/", "/health"}):
            continue

        path_item = paths.setdefault(path, {})
        for method in sorted(rule.methods & _HTTP_METHODS):
            details = _OPERATION_DETAILS.get((method, path), {})
            operation = {
                "operationId": f"{method.lower()}_{path.strip('/').replace('/', '_').replace('{', '').replace('}', '') or 'root'}",
                "summary": details.get(
                    "summary", f"{method} {_tag_for_path(path)} endpoint"
                ),
                "tags": [_tag_for_path(path)],
                "responses": {
                    "200": {"description": "Successful response"},
                    "default": {"description": "Error response"},
                },
                **(
                    {"description": details["description"]}
                    if "description" in details
                    else {}
                ),
            }

            parameters = _path_parameters(rule)
            if parameters:
                operation["parameters"] = parameters

            if path.startswith("/api/") and path not in _PUBLIC_API_PATHS:
                operation["security"] = [{"BearerAuth": []}]

            if method in {"POST", "PUT", "PATCH"}:
                body = _REQUEST_BODIES.get((method, path))
                operation["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": (
                                {
                                    "type": "object",
                                    "required": body["required"],
                                    "properties": body["properties"],
                                    "additionalProperties": False,
                                }
                                if body
                                else {
                                    "type": "object",
                                    "additionalProperties": True,
                                }
                            ),
                            **({"example": body["example"]} if body else {}),
                        }
                    },
                }

            path_item[method.lower()] = operation

    return {
        "openapi": "3.0.3",
        "info": {
            "title": "AfyaCare Backend API",
            "version": "1.0.0",
            "description": "Interactive API documentation for backend testing.",
        },
        "servers": [{"url": "/"}],
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                }
            }
        },
        "paths": paths,
    }


def register_openapi(app: Flask) -> None:
    enabled = app.config.get("SWAGGER_UI_ENABLED")
    if enabled is None:
        enabled = app.testing or app.debug
    if not enabled:
        return

    @app.get("/api/openapi.json")
    def openapi_json():
        return jsonify(create_openapi_spec(app))

    @app.get("/api/docs")
    def swagger_ui():
        return render_template("swagger_ui.html")
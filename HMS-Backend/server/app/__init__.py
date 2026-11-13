from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_restful import Api

from app.extensions import db, bcrypt

migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    app.config.from_object("app.config.Config")
    app.config.setdefault("JWT_SECRET_KEY", app.config.get("SECRET_KEY", "dev-secret-key"))
    app.config.setdefault("JWT_TOKEN_LOCATION", ["headers"])
    app.config.setdefault("JWT_HEADER_NAME", "Authorization")
    app.config.setdefault("JWT_HEADER_TYPE", "Bearer")

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    migrate.init_app(app, db)

    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:3000",
            "http://localhost:4173",
            "http://localhost:5173",
            "http://localhost:5555",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:4173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5555",
        ],
    )

    from app import models

    with app.app_context():
        db.create_all()

    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "service": "afyacare-backend"}), 200

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({"message": "AfyaCare backend is running"}), 200

    api = Api(app)

    try:
        from app.routes.auth_routes import Signup, Login, Logout, Checksession
        api.add_resource(Signup, "/api/auth/signup")
        api.add_resource(Login, "/api/auth/login")
        api.add_resource(Logout, "/api/auth/logout")
        api.add_resource(Checksession, "/api/auth/checksession")
    except Exception:
        pass

    try:
        from app.routes.admin_routes import AdminDashboard, AdminUserList, AdminUserDetail
        api.add_resource(AdminDashboard, "/api/admin/dashboard")
        api.add_resource(AdminUserList, "/api/admin/users")
        api.add_resource(AdminUserDetail, "/api/admin/users/<int:id>")
    except Exception:
        pass

    try:
        from app.routes.doctor_routes import DoctorList, DoctorDetail
        api.add_resource(DoctorList, "/api/doctors")
        api.add_resource(DoctorDetail, "/api/doctors/<int:id>")
    except Exception:
        pass

    try:
        from app.routes.patient_routes import PatientList, PatientDetail
        api.add_resource(PatientList, "/api/patients")
        api.add_resource(PatientDetail, "/api/patients/<int:id>")
    except Exception:
        pass

    try:
        from app.routes.appointment_routes import appointment_bp
        app.register_blueprint(appointment_bp)
    except Exception:
        pass

    try:
        from app.routes.notification_routes import notification_bp
        app.register_blueprint(notification_bp)
    except Exception:
        pass

    return app
from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_restful import Api

from app.extensions import db, bcrypt

migrate = Migrate()
jwt = JWTManager()


def create_app(test_config=None):
    app = Flask(__name__)

    app.config.from_object("app.config.Config")
    if test_config:
        app.config.update(test_config)
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

    from app.routes.admin_routes import (
        AdminDashboard,
        AdminUserDetail,
        AdminUserList,
    )
    from app.routes.appointment_routes import appointment_bp
    from app.routes.auth_routes import Checksession, Login, Logout, Signup
    from app.routes.billing_routes import billing_bp
    from app.routes.doctor_routes import DoctorDetail, DoctorList
    from app.routes.laboratory_routes import LaboratoryTestDetail, LaboratoryTestList
    from app.routes.medical_record_routes import (
        MedicalRecordDetail,
        MedicalRecordList,
        PatientMedicalHistory,
    )
    from app.routes.notification_routes import notification_bp
    from app.routes.patient_routes import PatientDetail, PatientList
    from app.routes.pharmacy_routes import MedicineDetail, MedicineList
    from app.routes.prescription_routes import PrescriptionDetail, PrescriptionList

    api.add_resource(Signup, "/api/auth/signup")
    api.add_resource(Login, "/api/auth/login")
    api.add_resource(Logout, "/api/auth/logout")
    api.add_resource(Checksession, "/api/auth/checksession")
    api.add_resource(AdminDashboard, "/api/admin/dashboard")
    api.add_resource(AdminUserList, "/api/admin/users")
    api.add_resource(AdminUserDetail, "/api/admin/users/<int:id>")
    api.add_resource(DoctorList, "/api/doctors")
    api.add_resource(DoctorDetail, "/api/doctors/<int:id>")
    api.add_resource(PatientList, "/api/patients")
    api.add_resource(PatientDetail, "/api/patients/<int:id>")
    api.add_resource(MedicineList, "/api/pharmacy/medicines")
    api.add_resource(MedicineDetail, "/api/pharmacy/medicines/<int:medicine_id>")
    api.add_resource(LaboratoryTestList, "/api/laboratory/tests")
    api.add_resource(LaboratoryTestDetail, "/api/laboratory/tests/<int:test_id>")
    api.add_resource(MedicalRecordList, "/api/medical-records")
    api.add_resource(MedicalRecordDetail, "/api/medical-records/<int:record_id>")
    api.add_resource(
        PatientMedicalHistory, "/api/patients/<int:patient_id>/medical-history"
    )
    api.add_resource(PrescriptionList, "/api/prescriptions")
    api.add_resource(
        PrescriptionDetail, "/api/prescriptions/<int:prescription_id>"
    )
    app.register_blueprint(appointment_bp)
    app.register_blueprint(billing_bp)
    app.register_blueprint(notification_bp)

    return app
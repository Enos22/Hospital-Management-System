AfyaCare Hospital Management System Backend
Project overview, setup, and team responsibilities
AfyaCare is a hospital management system with a Flask backend and a React client. The backend is designed to provide REST APIs for hospital operations, using Flask-SQLAlchemy and SQLite for data storage, Marshmallow for validation and serialization, and Flask-Migrate for database migrations.
The team assignments below describe responsibilities and planned deliverables. They do not guarantee that every listed feature or endpoint is already implemented; check the current source code for implementation status.
Technology
•	Python
•	Flask
•	Flask-SQLAlchemy
•	SQLite
•	Marshmallow
•	Flask-Migrate
•	React client
Project diagram
The repository includes a project diagram. In the README, reference it with a relative path such as: ![AfyaCare system diagram](diagram.png). Keep the image beside the README, or adjust the path if it is stored in another folder.
Project structure
HMS-Backend/
└── server/
    ├── app/
    ├── instance/
    ├── migrations/
    │   └── versions/
    ├── tests/
    ├── requirements.txt
    ├── run.py
    ├── seed.py
    ├── diagram.png
    └── README.md
# Setup
Run the following commands from the HMS-Backend/server directory.
Create and activate a virtual environment:
python -m venv venv
# Windows PowerShell
.\venv\Scripts\Activate.ps1
# macOS or Linux
source venv/bin/activate
Install dependencies:
pip install -r requirements.txt
# Configuration
Configure the environment variables required by the Flask application, such as its secret key and database connection string. Check the backend configuration for the exact variable names and defaults used by your current setup. Keep private keys and local environment files out of version control.
# Database migrations
    Flask-Migrate manages database schema changes. Typical commands are:
    flask db migrate -m "Describe the database change"
    flask db upgrade
Run Flask commands from the server directory and use the application entry point configured by the project.
Run the server
If run.py is the configured entry point, start the development server with:
        python run.py
The address and port depend on the application configuration.
Backend team roles and responsibilities
The following assignments summarize the file-by-file development guide and expected work for each role.
**Benson | Database and Models Lead**
Main responsibility. Database architecture, SQLAlchemy models, relationships, foreign keys, and validation schemas.
•	Model users, patients, doctors, specialties, appointments, medical records, prescriptions, laboratory requests and results, medicines, invoices, payments, notifications, and audit logs.
•	Create patient, doctor, appointment, billing, and prescription schemas.
Expected deliverables. SQLAlchemy models, relationships and constraints, validation schemas, database design documentation and ERD, and migration support.
**Enos | Authentication and Users**
Main responsibility. Authentication, user accounts, roles, patient and doctor management, and administration.
•	Implement user registration, login, logout where supported, and profile retrieval.
•	Handle JWT verification, password hashing and verification, protected endpoints, and role-based access checks.
•	Build patient and doctor management APIs and administrator operations.
Expected deliverables. Secure authentication, protected routes, role-based authorization, patient and doctor APIs, and administrative APIs.
**Antony | Appointments and Scheduling**
Main responsibility. Appointment booking, scheduling, rescheduling, cancellation, and prevention of double-booking.
•	Build appointment routes and business logic.
•	Manage doctor availability, working hours, time slots, and scheduling rules.
•	Validate appointment inputs, standardize API responses, and check overlapping bookings.
Expected deliverables. Appointment management APIs, availability checks, rescheduling and cancellation, input validation, and double-booking prevention.
**Hamphry | Medical Records and Prescriptions**
Main responsibility. Medical records, prescriptions, laboratory management, pharmacy operations, and related business logic.
•	Manage patient medical history and records, including diagnoses, symptoms, and treatments.
•	Create and retrieve prescriptions, and validate medicine details.
•	Support laboratory test requests and results, medicine information, stock management, and appropriate access restrictions for sensitive information.
Expected deliverables. Medical record and history management, prescription management, laboratory requests and results, and pharmacy functionality.
**Gift | Billing and Reports**
Main responsibility. Invoices, billing operations, financial reports, statistics, and matching services.
•	Generate invoices and manage payment records, billing calculations, and outstanding balances.
•	Prepare revenue summaries, payment statistics, outstanding invoice reports, and other billing reports.
•	Match patients with suitable doctors or services using defined criteria such as specialty and availability.
Expected deliverables. Invoice generation, payment tracking, billing calculations, outstanding balance management, revenue reports, hospital financial statistics, and matching logic.
**Cindy | Notifications and Quality Assurance**
Main responsibility. Notifications, API and integration testing, Postman documentation, and quality assurance.
•	Coordinate notification creation, delivery, and status tracking.
•	Test authentication, patient, doctor, appointment, and billing behavior, including access permissions and validation.
•	Maintain an organized Postman collection with requests, bodies, headers, authentication, and expected responses.
Expected deliverables. Notification functionality, API and integration tests, Postman documentation, bug reports, and verification of API responses and permissions.
Validation and API documentation

Marshmallow schemas are intended to validate and serialize API data. Refer to the current route and schema files for implemented endpoints, required request fields, response formats, and access requirements. Keep the Postman collection aligned with endpoints available in the code.
Development notes
•	Coordinate changes to shared models and database migrations.
•	Review the relevant models, routes, schemas, and services before changing a feature.
•	Create and apply migrations when database models change.
•	Add or update tests for the behavior being developed.
•	Keep environment files, credentials, and other secrets out of version control.

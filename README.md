AfyaCare Hospital Management System — Backend
AfyaCare is the backend for a hospital management system. It provides REST APIs for the React client and uses Flask, Flask-SQLAlchemy, and SQLite to manage application data.
Features
The backend includes modules for:
- Patients
- Doctors
- Appointments
- Billing, invoices, and payments
- User accounts and authentication
- Request validation with Marshmallow schemas
Technology
- Python
- Flask
- Flask-SQLAlchemy
- SQLite
- Marshmallow
- Flask-Migrate
- React client


PROJECT DIAGRAM

![AfyaCare system diagram](diagram.png)

Project structure
    HMS-Backend/
    └── server/
        ├── app/
        ├── models/
        ├── routes/
        ├── schemas/
        ├── services/
        ├── migrations/
        ├── tests/
        ├── requirements.txt
        └── run.py
The exact files and folders may vary as the backend develops.
Setup
Run commands from the HMS-Backend/server directory.

Create and activate a virtual environment:
**python -m venv .venv**
On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
On macOS or Linux:
**source .venv/bin/activate**
Install the project dependencies:
**pip install -r requirements.txt**
Configuration
    Set the required environment variables for your local configuration. For example:
    SECRET_KEY=your-private-secret-key
    DATABASE_URL=sqlite:///app.db
Keep private keys out of source control. Check the application configuration for the variable names and defaults used by your checkout.
## Database migrations
The backend uses Flask-Migrate to manage database schema changes. From the server directory, use the migration commands configured for the application:
- flask db migrate -m "Describe the database change"
- flask db upgrade
Run the server
    Start the Flask application using the run command defined by the backend. A common entry point is:
    **python run.py**
    The server address and port depend on the application configuration.
API
    The backend exposes REST API routes for its implemented modules. Check the route files for the current paths, HTTP methods, required fields, and response formats. Protected routes require the authentication method configured by the application.
Validation
    Marshmallow schemas validate and serialize request and response data. Invalid requests should be corrected based on the validation errors returned by the API.
Frontend
The React client communicates with the backend over HTTP. Configure the client’s API base URL and the backend’s CORS settings to match the local development ports used by your project.
/*
 * TODO: Declare public routes and protected role-specific portal route trees.
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./navigation/routePaths";
import {RequireAuth, RequireRole} from "../lib/auth/guards.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import ForbiddenPage from "../pages/ForbiddenPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import PortalLayout from "../components/layout/PortalLayout.jsx";

import AdminDashboardPage from "../portals/admin/DashboardPage.jsx";
import AdminUsersPage from "../portals/admin/UsersPage.jsx";
import AdminDoctorsPage from "../portals/admin/DoctorsPage.jsx";
import AdminPatientsPage from "../portals/admin/PatientsPage.jsx";
import AdminAppointmentsPage from "../portals/admin/AppointmentsPage.jsx";
import AdminPharmacyPage from "../portals/admin/PharmacyPage.jsx";
import AdminBillingPage from "../portals/admin/BillingPage.jsx";
import AdminReportsPage from "../portals/admin/ReportsPage.jsx";

import DoctorAppointmentsPage from "../portals/doctor/AppointmentsPage.jsx";
import DoctorPatientsPage from "../portals/doctor/PatientsPage.jsx";
import DoctorPatientDetailPage from "../portals/doctor/PatientDetailPage.jsx";
import DoctorMedicalRecordsPage from "../portals/doctor/MedicalRecordsPage.jsx";
import DoctorPrescriptionsPage from "../portals/doctor/PrescriptionsPage.jsx";
import DoctorLaboratoryPage from "../portals/doctor/LaboratoryPage.jsx";
import DoctorPharmacyPage from "../portals/doctor/PharmacyPage.jsx";

import PatientHomePage from "../portals/patient/HomePage.jsx";
import PatientBookAppointmentPage from "../portals/patient/BookAppointmentPage.jsx";
import PatientAppointmentsPage from "../portals/patient/AppointmentsPage.jsx";
import PatientMedicalHistoryPage from "../portals/patient/MedicalHistoryPage.jsx";
import PatientPrescriptionsPage from "../portals/patient/PrescriptionsPage.jsx";
import PatientLaboratoryPage from "../portals/patient/LaboratoryPage.jsx";
import PatientBillsPage from "../portals/patient/BillsPage.jsx";

import BillingInvoicesPage from "../portals/billing/InvoicesPage.jsx";
import BillingOutstandingPage from "../portals/billing/OutstandingPage.jsx";
import BillingReportsPage from "../portals/billing/ReportsPage.jsx";

function RoleLayout({ role }) {
    return (
        <RequireRole allowed={[role]}>
            <PortalLayout />
        </RequireRole>
    );
}

export default function AppRouter() {

    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

            <Route element={<RequireAuth />}>
            <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
            <Route path="/admin" element={<RoleLayout role="admin" />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="doctors" element={<AdminDoctorsPage />} />
                <Route path="patients" element={<AdminPatientsPage />} />
                <Route path="appointments" element={<AdminAppointmentsPage />} />
                <Route path="pharmacy" element={<AdminPharmacyPage />} />
                <Route path="billing" element={<AdminBillingPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
            </Route>
            <Route path="/doctor" element={<RoleLayout role="doctor" />}>
                <Route index element={<Navigate to="appointments" replace />} />
                <Route path="appointments" element={<DoctorAppointmentsPage />} />
                <Route path="patients" element={<DoctorPatientsPage />} />
                <Route path="patients/:patientId" element={<DoctorPatientDetailPage />} />
                <Route path="records" element={<DoctorMedicalRecordsPage />} />
                <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
                <Route path="lab" element={<DoctorLaboratoryPage />} />
                <Route path="pharmacy" element={<DoctorPharmacyPage />} />
            </Route>
            <Route path="/patient" element={<RoleLayout role="patient" />}>
                <Route index element={<PatientHomePage />} />
                <Route path="book" element={<PatientBookAppointmentPage />} />
                <Route path="appointments" element={<PatientAppointmentsPage />} />
                <Route path="history" element={<PatientMedicalHistoryPage />} />
                <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
                <Route path="lab" element={<PatientLaboratoryPage />} />
                <Route path="bills" element={<PatientBillsPage />} />
            </Route>
            <Route path="/billing" element={<RoleLayout role="billing" />}>
                <Route index element={<Navigate to="invoices" replace />} />
                <Route path="invoices" element={<BillingInvoicesPage />} />
                <Route path="outstanding" element={<BillingOutstandingPage />} />
                <Route path="reports" element={<BillingReportsPage />} />
            </Route>
            
            </Route>

            <Route path="*" element={<NotFoundPage />} />

        </Routes>        
        </BrowserRouter>
    );
}
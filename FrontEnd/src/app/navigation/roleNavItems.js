/*
 * TODO: Define sidebar items by backend role. This controls visibility, not access.
 */
import { ROUTES } from "./routePaths";

export const ROLE_NAV_ITEMS = {

    admin: [
        { label: "Dashboard", path: ROUTES.ADMIN.DASHBOARD, icon: "dashboard" },
        { label: "Users", path: ROUTES.ADMIN.USERS, icon: "users" },
        { label: "Doctors", path: ROUTES.ADMIN.DOCTORS.DASHBOARD, icon: "doctors" },
        { label: "Patients", path: ROUTES.ADMIN.PATIENTS.DASHBOARD, icon: "patients" },
        { label: "Appointments", path: ROUTES.ADMIN.APPOINTMENTS, icon: "appointments" },
        { label: "Pharmacy", path: ROUTES.ADMIN.PHARMACY, icon: "pharmacy" },
        { label: "Billing", path: ROUTES.ADMIN.BILLING, icon: "billing" },
        { label: "Reports", path: ROUTES.ADMIN.REPORTS, icon: "reports" },
    ],
    doctor: [
        { label: "Appointments", path: ROUTES.DOCTOR.APPOINTMENTS, icon: "appointments" },
        { label: "Patients", path: ROUTES.DOCTOR.PATIENTS, icon: "patients" },
        { label: "Medical Records", path: ROUTES.DOCTOR.RECORDS, icon: "records" },
        { label: "Prescriptions", path: ROUTES.DOCTOR.PRESCRIPTIONS, icon: "prescriptions" },
        { label: "Laboratory", path: ROUTES.DOCTOR.LAB, icon: "lab" },
        { label: "Pharmacy", path: ROUTES.DOCTOR.PHARMACY, icon: "pharmacy" },
    ],
    patient: [
        { label: "Home", path: ROUTES.PATIENT.HOME, icon: "home" },
        { label: "Book Appointment", path: ROUTES.PATIENT.BOOK, icon: "book" },
        { label: "My Appointments", path: ROUTES.PATIENT.APPOINTMENTS, icon: "appointment" },
        { label: "Medical History", path: ROUTES.PATIENT.HISTORY, icon: "records" },
        { label: "Prescriptions", path: ROUTES.PATIENT.PRESCRIPTIONS, icon: "prescriptions" },
        { label: "Laboratory", path: ROUTES.PATIENT.LAB, icon: "lab" },
        { label: "My Bills", path: ROUTES.PATIENT.BILLS, icon: "billing" },
    ],
    billing: [
        { label: "Invoices", path: ROUTES.BILLING.INVOICES, icon: "billing" },
        { label: "Outstanding", path: ROUTES.BILLING.OUTSTANDING, icon: "outstanding" },
        { label: "Reports", path: ROUTES.BILLING.REPORTS, icon: "reports" },
    ],
};

export function getNavItemsForRole(role) {
    return ROLE_NAV_ITEMS[role] || [];
}
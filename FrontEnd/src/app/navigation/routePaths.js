/*
 * TODO: Export shared frontend route-path constants for links and redirects.
 */
export const ROUTES = {
    LOGIN: "/login",
    SIGNUP:"/signup",
    FORBIDDEN:"/forbidden",
    NOTIFICATIONS: "/notifications",
    ADMIN: {DASHBOARD: "/admin", 
        USERS: "/admin/users", 
        DOCTORS:"/admin/doctors", 
        PATIENTS: "/admin/patients", 
        APPOINTMENTS: "/admin/appointments",
        PHARMACY: "/admin/pharmacy",
        BILLING: "/admin/billing",
        REPORTS: "/admin/reports"    
    },
    DOCTOR: { APPOINTMENTS: "/doctor/appointments",
        PATIENTS: "/doctor/patients", 
        RECORDS : "/doctor/records",
        PRESCRIPTIONS: "/doctor/prescriptions",
        LAB: "/doctor/lab",
        PHARMACY: "/doctor/pharmacy",
    },
    PATIENT: {HOME: "/patient",
        BOOK:"/patient/book",
        APPOINTMENTS: "/patient/appointments",
        HISTORY: "/patient/history",
        PRESCRIPTIONS: "/patient/prescriptions",
        LAB: "/patient/lab",
        BILLS: "/patient/bills"
    },
    BILLING: {INVOICES: "/billing/invoices",
        OUTSTANDING: "/billing/outstanding",
        REPORTS: "/billing/reports"
    },

    };
    
        export function getLandingForRole(role) {
        if (role === 'admin') return ROUTES.ADMIN.DASHBOARD;
        if (role === 'doctor') return ROUTES.DOCTOR.APPOINTMENTS;
        if (role === 'patient') return ROUTES.PATIENT.HOME;
        if (role === 'billing') return ROUTES.BILLING.INVOICES;

        return ROUTES.LOGIN
       
        }
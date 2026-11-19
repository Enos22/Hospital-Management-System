import { ROLES } from "../../lib/constants.js";
import { ROUTE_PATHS } from "./routePaths.js";

const commonItems = [
  { label: "Notifications", to: ROUTE_PATHS.notifications },
];

export const roleNavItems = Object.freeze({
  [ROLES.ADMIN]: [
    { label: "Dashboard", to: ROUTE_PATHS.adminDashboard },
    { label: "Patients", to: ROUTE_PATHS.adminPatients },
    { label: "Doctors", to: ROUTE_PATHS.adminDoctors },
    { label: "Appointments", to: ROUTE_PATHS.adminAppointments },
    { label: "Pharmacy", to: ROUTE_PATHS.adminPharmacy },
    { label: "Billing", to: ROUTE_PATHS.adminBilling },
    { label: "Reports", to: ROUTE_PATHS.adminReports },
    { label: "Users", to: ROUTE_PATHS.adminUsers },
    ...commonItems,
  ],
  [ROLES.DOCTOR]: [
    { label: "Patients", to: ROUTE_PATHS.doctorPatients },
    { label: "Appointments", to: ROUTE_PATHS.doctorAppointments },
    { label: "Pharmacy", to: ROUTE_PATHS.doctorPharmacy },
    { label: "Laboratory", to: ROUTE_PATHS.doctorLaboratory },
    { label: "Medical records", to: ROUTE_PATHS.doctorMedicalRecords },
    { label: "Prescriptions", to: ROUTE_PATHS.doctorPrescriptions },
    ...commonItems,
  ],
  [ROLES.PATIENT]: [
    { label: "Home", to: ROUTE_PATHS.patientHome },
    { label: "Appointments", to: ROUTE_PATHS.patientAppointments },
    { label: "Laboratory", to: ROUTE_PATHS.patientLaboratory },
    { label: "Medical history", to: ROUTE_PATHS.patientMedicalHistory },
    { label: "Prescriptions", to: ROUTE_PATHS.patientPrescriptions },
    { label: "Bills", to: ROUTE_PATHS.patientBills },
    ...commonItems,
  ],
});

export default roleNavItems;

import { ROLES } from "../../lib/constants.js";

export function canManagePharmacy(role) {
  return role === ROLES.ADMIN;
}

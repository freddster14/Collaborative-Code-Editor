import { Role } from "../../generated/prisma/enums.js";

export const PRIVILED_ROLES: Role[] = [Role.OWNER, Role.ADMIN] as const
export const AVAILABLE_ROLES = ["OWNER", "ADMIN", "EDIT", "VIEW"];

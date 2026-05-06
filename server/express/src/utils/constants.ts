import { Role } from "../../../generated/prisma/enums.ts";

export const PRIVILED_ROLES: Role[] = [Role.OWNER, Role.ADMIN, Role.CO_OWNER] as const
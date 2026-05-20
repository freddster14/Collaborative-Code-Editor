import { Role, type RoleType } from "@cce/shared-types";

export const PRIVILED_ROLES: RoleType[] = [Role.OWNER, Role.ADMIN] as const
export const AVAILABLE_ROLES = ["OWNER", "ADMIN", "EDIT", "VIEW"];

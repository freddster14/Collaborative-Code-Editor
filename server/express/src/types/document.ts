import { Role } from "@cce/prisma"

export interface RemoveUserInfo {
  id: number,
  userId: number,
  role: Role,
  document: {
    folder: {
      userId: number,
    }
  }
}
import { UserTokenInfo } from "@cce/shared-types"

declare global {
  namespace Express {
    interface Request {
      user: UserTokenInfo
    }
  }
}

export interface UserToken {
  id: number,
  username: string,
  iat: number,
  exp: number,
  jti: number
}
declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}

export interface User {
  id: number,
  username: string,
}

export interface UserToken {
  id: number,
  username: string,
  iat: number,
  exp: number,
  jti: number
}


declare global {
  namespace Express {
    interface Request {
      user: UserToken
    }
  }
}

export interface UserToken {
  id: number,
  username: string,
}


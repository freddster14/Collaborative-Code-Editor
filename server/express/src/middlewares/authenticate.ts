import "dotenv/config"
import { type NextFunction, type Request, type Response } from "express";
import jwt, { type Jwt, type JwtPayload, type VerifyErrors } from "jsonwebtoken"
import type { UserToken } from "../types/user-token.js";
import requireEnv from "../utils/env.js";

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token || null;

  if(!token) return res.status(401);

  jwt.verify(token, requireEnv("SECRET"), (err: VerifyErrors | null, decoded: string | Jwt | JwtPayload | undefined) => {
    if (err) return next(err);
      if(decoded) {
        const payload = decoded as UserToken
        req.user = {
          id: payload.id,
          username: payload.username,
        }
      }
  })
  
  next();
}
import { type NextFunction, type Request, type Response } from "express";
import jwt, { type Jwt, type JwtPayload, type VerifyErrors } from "jsonwebtoken"
import type { UserToken } from "../types/user-token.js";
import requireEnv from "../utils/env.js";

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token || null;

  if(!token) return res.status(401);


  jwt.verify(token, requireEnv("SECRET"), (err: VerifyErrors | null, decoded: string | Jwt | JwtPayload | undefined) => {
    if(err instanceof jwt.TokenExpiredError) {

    } else {
      next(err)
    }
    console.log(decoded)

    const payload = decoded as UserToken
    // create new token, when expiring within 12 hours
    if(payload.exp - Math.floor(Date.now() / 1000) < 43200) {
      const token = jwt.sign(
        { id: payload.id, username: payload.username },
        requireEnv("SECRET"),
        { expiresIn: "5d" }
      )
      // NEED TO DO: STORE JWT ID TO REDIT - BLACKLIST
  
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 5 // 5 days
  
      })
    } else {
      req.user = {
        id: payload.id,
        username: payload.username,
      }
    }
  })
  
  next();
}

import { type NextFunction, type Request, type Response } from "express";
import jwt, { type Jwt, type JwtPayload, type VerifyErrors } from "jsonwebtoken"
import type { UserToken } from "../types/user-token.js";
import requireEnv from "../utils/env.ts";
import redis from "../../redis.ts";

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token || null;

  if(!token) return res.status(401).send("No token provided");

  jwt.verify(token, requireEnv("SECRET"), async (err: VerifyErrors | null, decoded: string | Jwt | JwtPayload | undefined) => {
    if(err) return next(err);

    const payload = decoded as unknown as UserToken

    const listed = await redis.get(`${payload.jti}`)
    if(listed) return next(new Error("Blacklisted"));

    // create new token, when expiring within 12 hours
    const timeLeft = payload.exp - Math.floor(Date.now() / 1000);
    if(timeLeft < 43200) {
      const newToken = jwt.sign(
        { id: payload.id, username: payload.username, jti: crypto.randomUUID() },
        requireEnv("SECRET"),
        { expiresIn: "5d" }
      )
      // NEED TO DO: STORE JWT ID TO REDIS - BLACKLIST
      await redis.set(`${payload.jti}`, "listed", { EX: timeLeft})

      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 5 // 5 days
  
      })
    } 

    req.user = {
      id: payload.id,
      username: payload.username,
    }

    next();
  })
}

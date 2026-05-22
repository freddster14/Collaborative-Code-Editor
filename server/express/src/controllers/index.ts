import { type NextFunction, type Request, type Response } from "express"
import bcrypt from "bcrypt";
import { prisma } from "@cce/prisma";
import jwt from "jsonwebtoken";
import requireEnv from "../utils/env.js";
import type { User } from "@cce/shared-types";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        hashedPass,
      }
    })
    
    const token = jwt.sign(
      { id: user.id, username: user.username, jti: crypto.randomUUID() },
      requireEnv("SECRET"),
      { expiresIn: "5d" }
    )
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 5 // 5 days
    })
    return res.status(201).json({ id: user.id, username: user.username })
  } catch (error) {
    next(error);
  }
}

export const signInUser = async (req: Request<{}, {}, {identifier:string, password:string}>, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;
  try {
    let user:User | null;
    if(identifier.includes('@')) {
      user = await prisma.user.findUnique({ where: { email: identifier }})
    } else {
      user = await prisma.user.findUnique({ where: { username: identifier }})
    }

    if(!user) return res.status(400).send({ main: "Invalid credentials"});

    const isMatch = await bcrypt.compare(password, user.hashedPass);
    if(!isMatch) return res.status(400).send({ main: "Invalid credentials"})

    const token = jwt.sign(
      { id: user.id, username: user.username, jti: crypto.randomUUID() },
      requireEnv("SECRET"),
      { expiresIn: "5d" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 5 // 5 days

    })

    return res.status(200).json({ id: user.id, username: user.username })
  } catch (error) {
    next(error)
  }
}

export const logoff = async (req:Request, res:Response, next:NextFunction) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ msg: "Logged Off"})
  } catch (error) {
    next(error)
  }
}
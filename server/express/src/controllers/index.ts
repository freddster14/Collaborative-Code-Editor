import { type NextFunction, type Request, type Response } from "express"
import bcrypt from "bcrypt";
import { prisma } from "../../../prisma/client.ts";
import jwt from "jsonwebtoken";
import requireEnv from "../utils/env.js";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, confirm, username } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    console.log(email, password, hashedPass)

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

export const signInUser = async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;
  try {
    let user;
    if(identifier.includes('@')) {
      user = await prisma.user.findUnique({ where: { email: identifier }})
    } else {
      user = await prisma.user.findUnique({ where: { username: identifier }})
    }

    if(!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.hashedPass);
    if(!isMatch) return res.status(400).send("Invalid credentials")

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

export const getUser = async (req: Request, res:Response, next: NextFunction) => {
  res.status(200).json(req.user)
}


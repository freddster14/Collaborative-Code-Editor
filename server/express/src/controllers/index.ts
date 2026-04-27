import "dotenv/config";
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
      { id: user.id, username: user.username },
      requireEnv("SECRET"),
      { expiresIn: 60 * 60 * 24 * 5} // 5 days
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

export const signInUser = (req: Request, res: Response) => {
  const { identifier, password } = req.body;


}
import { type Request, type Response } from "express"

export const createUser = (req: Request, res: Response) => {
  const { email, password, confirm, username } = req.body;


}

export const signInUser = (req: Request, res: Response) => {
  const { identifier, password } = req.body;


}
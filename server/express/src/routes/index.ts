import { Router } from "express";
import { createUser } from "../controllers/index.js";

const index = Router()

index.post('/sign-up', createUser)
index.post('/sign-in', signInUser)

export default index
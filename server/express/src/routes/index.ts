import { Router } from "express";
import { createUser, getUser, signInUser } from "../controllers/index.js";
import { authenticateUser } from "../middlewares/authenticate.ts";

const index = Router()

index.post('/sign-up', createUser)
index.post('/sign-in', signInUser)
index.get('/user', authenticateUser, getUser)


export default index
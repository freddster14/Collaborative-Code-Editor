import { Router } from "express";
import { createUser, logoff, signInUser } from "../controllers/index.js";
import { authenticateUser } from "../middlewares/authenticate.js";

const index = Router()

index.post('/sign-up', createUser);
index.post('/sign-in', signInUser);
index.post('/logout', authenticateUser, logoff)

export default index
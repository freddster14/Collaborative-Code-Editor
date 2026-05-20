import { Router } from "express";
import { createUser, logoff, signInUser } from "../controllers/index.js";
import { authenticateUser } from "../middlewares/authenticate.js";
import { validateSignIn, validateSignUp } from "../middlewares/validation.js";

const index = Router()

index.post('/sign-up', validateSignUp, createUser);
index.post('/sign-in', validateSignIn, signInUser);
index.post('/logout', authenticateUser, logoff)

export default index
import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticate.ts";
import { getUser, searchUsersOnDoc } from "../controllers/user.ts";

const user = Router();


user.get('/', authenticateUser, getUser);
user.get('/search/:docId', authenticateUser, searchUsersOnDoc)

export default user;
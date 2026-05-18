import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticate.js";
import { getUser, searchUsersOnDoc } from "../controllers/user.js";

const user = Router();


user.get('/', authenticateUser, getUser);
user.get('/search/:docId', authenticateUser, searchUsersOnDoc)

export default user;
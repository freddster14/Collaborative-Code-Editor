import { Router } from "express";
import { createFolder, getFolder, getProjects } from "../controllers/folder.ts";
import { authenticateUser } from "../middlewares/authenticate.ts";

const folder = Router();

//folder.get('/:id/doc', getDocs);
folder.get('/', authenticateUser, getProjects)
folder.get('/:id', authenticateUser, getFolder);
folder.post('/', authenticateUser, createFolder);
//folder.put('/:id', updateFolder);
//folder.delete('/:id', deleteFolder);

export default folder;
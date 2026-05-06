import { Router } from "express";
import { createFolder, deleteFolder, getFolder, getProjects, updateFolder } from "../controllers/folder.ts";
import { authenticateUser } from "../middlewares/authenticate.ts";

const folder = Router();

folder.get('/', authenticateUser, getProjects)
folder.get('/:id', authenticateUser, getFolder);

folder.post('/', authenticateUser, createFolder);
folder.put('/:id', authenticateUser, updateFolder);
folder.delete('/:id', authenticateUser, deleteFolder);

export default folder;
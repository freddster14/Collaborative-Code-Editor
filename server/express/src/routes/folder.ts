import { Router } from "express";
import { createFolder, deleteFolder, getFolder, getProjects, updateFolder } from "../controllers/folder.js";
import { authenticateUser } from "../middlewares/authenticate.js";
import { validateName } from "../middlewares/validation.js";

const folder = Router();

folder.get('/', authenticateUser, getProjects)
folder.get('/:id', authenticateUser, getFolder);

folder.post('/', authenticateUser, validateName, createFolder);
folder.put('/:id', authenticateUser, validateName, updateFolder);
folder.delete('/:id', authenticateUser, deleteFolder);

export default folder;
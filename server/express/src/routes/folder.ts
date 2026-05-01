import { Router } from "express";
import { createFolder, getFolder } from "../controllers/folder.ts";

const folder = Router();

//folder.get('/:id/doc', getDocs);
folder.get('/:id', getFolder);
folder.post('/', createFolder);
//folder.put('/:id', updateFolder);
//folder.delete('/:id', deleteFolder);

export default folder;
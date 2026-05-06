import { Router } from "express";
import { createDoc, editPermissions, generateWebsocketToken, grantPermissions, recentDocs } from "../controllers/document.ts";
import { authenticateUser } from "../middlewares/authenticate.ts";

const document = Router()


document.post("/:folderId", authenticateUser, createDoc)
document.get('/', authenticateUser, recentDocs);
document.get('/:docId', authenticateUser, generateWebsocketToken)
document.post('/permission/:docId', authenticateUser, grantPermissions)
document.put('/:docId', authenticateUser, editPermissions);

export default document;
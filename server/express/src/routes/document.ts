import { Router } from "express";
import { createDoc, deleteDocument, editPermissions, generateWebsocketToken, grantPermissions, recentDocs, transferOwnership, updateDoc } from "../controllers/document.ts";
import { authenticateUser } from "../middlewares/authenticate.ts";

const document = Router()

document.get('/', authenticateUser, recentDocs);
document.get('/:docId', authenticateUser, generateWebsocketToken)

document.post("/:folderId", authenticateUser, createDoc)
document.post('/permission/:docId', authenticateUser, grantPermissions)

document.put("/docId", authenticateUser, transferOwnership)
document.put('/:docId', authenticateUser, updateDoc)
document.put('/:docId', authenticateUser, editPermissions);

document.delete("/:docId", authenticateUser, deleteDocument)

export default document;
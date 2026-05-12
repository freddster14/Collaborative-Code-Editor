import { Router } from "express";
import { createDoc, deleteDocument, editRoles, generateWebsocketToken, grantAccess, recentDocs, transferOwnership, updateDoc } from "../controllers/document.ts";
import { authenticateUser } from "../middlewares/authenticate.ts";

const document = Router()

document.get('/', authenticateUser, recentDocs);
document.get('/:docId', authenticateUser, generateWebsocketToken)

document.post("/:folderId", authenticateUser, createDoc)
document.post('/permission/:docId', authenticateUser, grantAccess)

document.put("/transfer/:docId", authenticateUser, transferOwnership)
document.put('/:docId', authenticateUser, updateDoc)
document.put('/roles/:docId', authenticateUser, editRoles);

document.delete("/:docId", authenticateUser, deleteDocument)

export default document;
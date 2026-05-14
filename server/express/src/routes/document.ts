import { Router } from "express";
import { createDoc, deleteDocument, editRoles, generateWebsocketToken, getRoles, grantAccess, recentDocs, removeAccess, transferOwnership, updateDoc } from "../controllers/document.ts";
import { authenticateUser } from "../middlewares/authenticate.ts";

const document = Router()

document.get('/', authenticateUser, recentDocs);
document.get('/:docId', authenticateUser, generateWebsocketToken);
document.get('/roles/:docId', authenticateUser, getRoles);

document.post("/:folderId", authenticateUser, createDoc);
document.post('/permission/:docId', authenticateUser, grantAccess);

document.put("/transfer/:docId", authenticateUser, transferOwnership);
document.put('/:docId', authenticateUser, updateDoc);
document.put('/roles/:docId', authenticateUser, editRoles);


document.delete('/:docId/remove/:id', authenticateUser, removeAccess)
document.delete("/:docId", authenticateUser, deleteDocument);

export default document;
import { Router } from "express";
import { createDoc, deleteDocument, editRoles, generateWebsocketToken, getAdmins, getRoles, grantAccess, myDocs, recentDocs, removeAccess, sharedDocs, transferOwnership, updateDoc } from "../controllers/document.js";
import { authenticateUser } from "../middlewares/authenticate.js";

const document = Router()

document.get('/', authenticateUser, myDocs);
document.get('/recent', authenticateUser, recentDocs)
document.get('/shared', authenticateUser, sharedDocs)
document.get('/:docId', authenticateUser, generateWebsocketToken);
document.get('/roles/:docId', authenticateUser, getRoles);
document.get('/admins/:docId', authenticateUser, getAdmins);

document.post("/:folderId", authenticateUser, createDoc);
document.post('/permission/:docId', authenticateUser, grantAccess);

document.put("/transfer/:docId", authenticateUser, transferOwnership);
document.put('/:docId', authenticateUser, updateDoc);
document.put('/roles/:docId', authenticateUser, editRoles);


document.delete('/:docId/remove/:id', authenticateUser, removeAccess);
document.delete("/:docId", authenticateUser, deleteDocument);

export default document;
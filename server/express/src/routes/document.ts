import { Router } from "express";
import { createDoc, deleteDocument, editRoles, generateWebsocketToken, getAdmins, getRoles, grantAccess, myDocs, recentDocs, removeAccess, sharedDocs, transferOwnership, updateDoc } from "../controllers/document.js";
import { authenticateUser } from "../middlewares/authenticate.js";
import { validateName, validateRoles } from "../middlewares/validation.js";

const document = Router()

document.get('/', authenticateUser, myDocs);
document.get('/recent', authenticateUser, recentDocs)
document.get('/shared', authenticateUser, sharedDocs)
document.get('/:docId', authenticateUser, generateWebsocketToken);
document.get('/roles/:docId', authenticateUser, getRoles);
document.get('/admins/:docId', authenticateUser, getAdmins);

document.post("/:folderId", authenticateUser, validateName, createDoc);
document.post('/permission/:docId', authenticateUser, validateRoles, grantAccess);

document.put("/transfer/:docId", authenticateUser, transferOwnership);
document.put('/:docId', authenticateUser, validateName, updateDoc);
document.put('/roles/:docId', authenticateUser, validateRoles, editRoles);


document.delete('/:docId/remove/:id', authenticateUser, removeAccess);
document.delete("/:docId", authenticateUser, deleteDocument);

export default document;
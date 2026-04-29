import { Router } from "express";
import { createDoc, editPermissions, generateWebsocketToken, grantPermissions } from "../controllers/document.ts";
import { authenticateUser } from "../middlewares/authenticate.ts";

const document = Router()


document.post("/", authenticateUser, createDoc)
document.get('/:docId', authenticateUser, generateWebsocketToken)
document.post('/:docId', authenticateUser, grantPermissions)
document.put('/:docId', authenticateUser, editPermissions);

export default document;
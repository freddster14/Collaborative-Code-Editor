import { type NextFunction, type Request, type Response } from "express"
import { prisma } from "../../../prisma/client.ts";
import jwt from "jsonwebtoken";
import requireEnv from "../utils/env.js";
import { PRIVILED_ROLES } from "../utils/constants.ts";

export const createDoc = async (req: Request, res: Response, next: NextFunction) => {
  const folderId = Number(req.params.folderId);
  const name = req.body.name;
  try {
    //name required for creation
    if(name === "") return res.status(400).send("Doc name required")
    const doc = await prisma.document.create({
      data: {
        name,
        folderId,
      }
    })

    await prisma.userDocuments.create({
      data: {
        documentId: doc.id,
        userId: req.user.id,
        role: "OWNER"
      }
    })

    res.status(201).json(doc)
  } catch (error) {
    next(error);
  }
}

export const updateDoc = async (req: Request, res: Response, next: NextFunction) => {
  const docId = Number(req.params.docId);
  const { name, doc } = req.body; 
  try {
    const document = await prisma.document.count({ where: { id: docId }});
    
    if(document === 0) return res.status(404).send("Doc not found/Page not found")
    const user = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId,
        }
      }
    });
    
    if(!user || user.role === "VIEW") return res.status(404).send("No able to edit doc")
    
    const newDoc = await prisma.document.update({
      where: { id: docId},
      data: {
        name,
        doc
      }
    })

    res.status(200).json(newDoc);
  } catch (error) {
    next(error);
  }
}


export const grantPermissions = async (req: Request, res: Response, next: NextFunction) => {
  const usersId = req.body.usersId
  const roles = req.body.permissions
  const docId = Number(req.params.id)

  try {
    const doc = await prisma.document.findUnique({
      where: { id: docId }
    });

    // doc not found
    if(!doc) return res.status(404).send("Doc not found")

    const user = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        }
      }
    });

    if(!user || !PRIVILED_ROLES.includes(user.role)) return res.status(404).send("No able to change permissions")
    for(let i = 0; i < usersId.length; i++) {
      await prisma.userDocuments.create({
        data: {
          userId: usersId[i],
          documentId: doc.id,
          role: roles[i]
        }
      })
    }
    
    res.status(201);
  } catch (error) {
    next(error)
  }
}


export const editPermissions = async (req: Request, res: Response, next: NextFunction) => {
  const usersId = req.body.usersId
  const roles = req.body.permissions
  const docId = Number(req.params.id)

  try {
    const doc = await prisma.document.findUnique({
      where: { id: docId }
    });

    // doc not found
    if(!doc) return res.status(404).send("Doc not found")
    for(let i = 0; i < usersId.length; i++) {
      if(roles[i] === "Remove") {
        await prisma.userDocuments.delete({ where: { userId_documentId: { userId: usersId[i], documentId: docId }}})
      } else {
        await prisma.userDocuments.create({
          data: {
            userId: usersId[i],
            documentId: doc.id,
            role: roles[i]
          }
        })
      }
    }
   
    res.status(201)
  } catch (error) {
    next(error)
  }
  
}

export const generateWebsocketToken = async (req: Request, res:Response, next: NextFunction) => {
  const docId = Number(req.params.docId);
  try {
    // Verify user can access document
    const authorized = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        }
      }
    })

    // return page not found error
    if(!authorized) return res.status(404).send("Not authotorized/Page not found")
      
    const wsToken = jwt.sign(
      { id: docId },
      requireEnv("SECRET"),
      { expiresIn: 1000 * 60 * 15 } // 15min
    )

    res.status(201).json(wsToken)
  } catch (error) {
    next(error)    
  }
}
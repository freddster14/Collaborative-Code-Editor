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
    if(name === "") return res.status(400).send("Document name required")
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

    res.status(201)
  } catch (error) {
    next(error);
  }
}


export const recentDocs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await prisma.userDocuments.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        document: true,
      },
      orderBy: {
        viewAt: 'desc'
      },
    })

    res.status(200).json(docs)
  } catch (error) {
    next(error)
  }
}

export const transferOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const userId = Number(req.body.userId);
  const docId = Number(req.params.docId);
  try {
    // Verify user's ownership
    const owner = await prisma.userDocuments.findUnique({
      where: {userId_documentId : {
        userId: req.user.id, documentId: docId
      }}
    });
    if (!owner) return res.status(404).send("Document not found");
    if (owner.role !== "OWNER") return res.status(404).send("Not able to change ownership");

    // verify selected user's ownership
    const newOwner = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId: docId
        }
      }
    });
    if (!newOwner) return res.status(404).send("User not found in document");
    if (!PRIVILED_ROLES.includes(newOwner.role)) return res.status(403).send("Not able to be promoted");
    
    await prisma.userDocuments.update({
      where: {
        userId_documentId: {
          userId: newOwner.id,
          documentId: docId
      }},
      data: {
        role: "OWNER"
      }
    });
    await prisma.userDocuments.update({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        }
      },
      data: {
        role: "VIEW"
      }
    });
    res.status(200);
  } catch (error) {
    next(error)
  }
}

export const updateDoc = async (req: Request, res: Response, next: NextFunction) => {
  const docId = Number(req.params.docId);
  const { name, doc } = req.body; 
  try {
    const user = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId,
        }
      }
    });
    if (!user) return res.status(404).send("Document not found")
    if(!PRIVILED_ROLES.includes(user.role)) return res.status(403).send("No able to edit document")
    
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
    // verify user is able to edit permissions
    const user = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        }
      }
    });
    if(!user) return res.status(404).send("Document not found");
    if(!PRIVILED_ROLES.includes(user.role)) return res.status(404).send("Unable to change permissions");

    for(let i = 0; i < usersId.length; i++) {
      if(roles[i] === "Remove") {
        await prisma.userDocuments.delete({ where: { userId_documentId: { userId: usersId[i], documentId: docId }}})
      } else {
        await prisma.userDocuments.update({
          where: {
            userId_documentId: {
              userId: usersId[i],
              documentId: docId,
            }
          },
          data: {
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

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  const docId = Number(req.body.docId)
  try {
     // verify user is owner
     const user = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        }
      }
    });
    if(!user) return res.status(404).send("Document not found");
    if(user.role !== "OWNER") return res.status(404).send("Unable to change permissions");

    await prisma.document.delete({
      where: {
        id: docId
      }
    });
    res.status(200).send("Deleted Document")
  } catch (error) {
    next(error)
  }
}

export const generateWebsocketToken = async (req: Request, res:Response, next: NextFunction) => {
  const docId = Number(req.params.docId);
  try {
    // Verify user can access document
    const authorized = await prisma.userDocuments.count({
      where: {
          userId: req.user.id,
          documentId: docId
      }
    })

    // return page not found error
    if(authorized === 0) return res.status(404).send("Not authotorized/Page not found")
      
    const wsToken = jwt.sign(
      { id: docId, userId: req.user.id, username: req.user.username },
      requireEnv("SECRET"),
      { expiresIn: 1000 * 60 * 15 } // 15min
    )

    res.status(201).json(wsToken)
  } catch (error) {
    next(error)    
  }
}
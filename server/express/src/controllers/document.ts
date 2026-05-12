import { type NextFunction, type Request, type Response } from "express"
import { prisma } from "../../../prisma/client.ts";
import jwt from "jsonwebtoken";
import requireEnv from "../utils/env.js";
import { AVAILABLE_ROLES, PRIVILED_ROLES } from "../utils/constants.ts";
import type { Role } from "../../../generated/prisma/enums.ts";

export const createDoc = async (req: Request, res: Response, next: NextFunction) => {
  const folderId:number = Number(req.params.folderId);
  const name:string = req.body.name;
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
    res.status(201).json(doc)
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
  const userId:number = Number(req.body.userId);
  const docId:number = Number(req.params.docId);
  try {
    // Verify user's ownership
    const owner: null | {role:Role} = await prisma.userDocuments.findUnique({
      where: {userId_documentId : {
        userId: req.user.id, documentId: docId
      }},
      select: {
        role: true
      }
    });
    if (!owner) return res.status(404).send("Document not found");
    if (owner.role !== "OWNER") return res.status(404).send("Not able to change ownership");

    // verify selected user's ownership
    const newOwner: null | {role: Role, userId:number}= await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId: docId
        }
      },
      select: {
        userId: true,
        role: true
      }
    });
    if (!newOwner) return res.status(404).send("User not found in document");
    if (!PRIVILED_ROLES.includes(newOwner.role)) return res.status(403).send("Not able to be promoted");

    await prisma.$transaction(async (prisma) => {
      await prisma.userDocuments.update({
        where: {
          userId_documentId: {
            userId: newOwner.userId,
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
    });
    res.status(200);
  } catch (error) {
    next(error)
  }
}

export const updateDoc = async (req: Request<{docId:string}, {}, {name:string}>, res: Response, next: NextFunction) => {
  const docId:number = Number(req.params.docId);
  const name  = req.body.name; 
  try {
    const user: null | {role:Role} = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId,
        }
      },
      select: {
        role: true
      }
    });
    if (!user) return res.status(404).send("Document not found")
    if(!PRIVILED_ROLES.includes(user.role)) return res.status(403).send("No able to edit document")
    
    const newDoc = await prisma.document.update({
      where: { id: docId},
      data: {
        name,
      }
    })

    res.status(204);
  } catch (error) {
    next(error);
  }
}


export const grantAccess = async (req: Request<{id:string},{},{usersId:number[], roles:Role[]}>, res: Response, next: NextFunction) => {
  const usersId = req.body.usersId
  const roles = req.body.roles
  const docId:number = Number(req.params.id)

  try {
    // verify document
    const doc:number = await prisma.document.count({
      where: { id: docId }
    });
    if(doc === 0) return res.status(404).send("Document not found")

    // verify user authorization
    const user: null | {role:Role} = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        }
      },
      select: {
        role: true
      }
      });
    if(!user) return res.status(404).send("Document not found");
    if(!PRIVILED_ROLES.includes(user.role)) return res.status(404).send("No able to change permissions")
    
    // validate usersId
    const dbUsersId = await prisma.user.findMany({
        where: { id: {in : usersId }},
        select: { id:true }
      });
    if(dbUsersId.length !== usersId.length) {
      const set = new Set(dbUsersId.map(u => u.id))
      const missing = []
      for(let i = 0; i < usersId.length; i++) {
        const id = usersId[i]
        if(id && !set.has(id)) missing.push(id)
      }
      return res.status(400).json({ msg: "Could not add users", missing })
    }
    // validate role hierchy
   

    // create access to document
    const currUserRole = AVAILABLE_ROLES.indexOf(user.role);
    const data: {userId:number, documentId:number, role:Role}[] = []
    for(let i = 0; i < usersId.length; i++) {
      const userId = usersId[i]
      const role = roles[i] 
      if(!userId || !role) return res.status(404).send("Something went wrong");
      if(currUserRole >= AVAILABLE_ROLES.indexOf(role)) return res.status(404).send("Could not update roles");
      data.push({ userId, documentId: docId, role })
    };
    await prisma.userDocuments.createMany({
      data
    });

    res.status(204);
  } catch (error) {
    next(error)
  }
}


export const editRoles = async (req: Request<{docId:string}, {}, {usersId:number[], roles: Role[]}>, res: Response, next: NextFunction) => {
  const usersId = req.body.usersId
  const roles = req.body.roles
  const docId = Number(req.params.docId)

  try {
    if(usersId.length === 0) return res.status(400).send("Nothing to update")

    // verify user authorization
    const user: null | {role:Role} = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        }
      },
      select: {
        role: true
      }
    });
    if(!user) return res.status(404).send("Document not found");
    if(!PRIVILED_ROLES.includes(user.role)) return res.status(404).send("Unable to change permissions");

    // validate users id
    const dbUsersId = await prisma.userDocuments.findMany({
      where: {
        userId: {in : usersId },
        documentId: docId
      },
      select: { userId:true, role: true }
    });
    if(dbUsersId.length !== usersId.length) {
      const set = new Set(dbUsersId.map(u => u.userId))
      const missing = []
      for(let i = 0; i < usersId.length; i++) {
        const id = usersId[i]
        if(id && !set.has(id)) missing.push(id)
      }
      return res.status(400).json({ msg: "Could not add users", missing })
    }   

    // update roles
    const data: {userId:number, documentId:number, role:Role}[] = [];
    const currUserRole = AVAILABLE_ROLES.indexOf(user.role);
    const prevRoles = new Map();
    for(let u of dbUsersId) {
      prevRoles.set(u.userId, u.role);
    }
    for(let i = 0; i < usersId.length; i++) {      
      const userId = usersId[i];
      const role = roles[i];
      const prevRole = prevRoles.get(userId);
      
      // validate role hierchy
      if(!userId || !role || !prevRole) return res.status(404).send("Something went wrong")
      if(currUserRole >= AVAILABLE_ROLES.indexOf(role)) return res.status(404).send("Could not update roles")
      if(currUserRole >= AVAILABLE_ROLES.indexOf(prevRole)) return res.status(404).send("Could not update roles")
      data.push({ userId, documentId: docId, role })
    };
    await prisma.$transaction(async (prisma) => {
      for(const d of data) {
        await prisma.userDocuments.update({
          where: { userId_documentId : {
            userId: d.userId,
            documentId: docId
          }},
          data: {
            role: d.role
          }
        })
      }
    });
    res.status(204)
  } catch (error) {
    next(error)
  }
}

export const removeAccess = async (req:Request<{docId:string, userId:string}>, res:Response, next:NextFunction) => {
  const docId = Number(req.params.docId);
  const userId = Number(req.params.userId);

  try {
    // validate user and user that will be removed
    const users = await prisma.userDocuments.findMany({
      where: {
          userId: { in: [req.user.id, userId]},
          documentId: docId
        },
        select: {
          userId: true,
          role: true
        }
    });
    const usersRoles = new Map();
    for(const u of users) {
      usersRoles.set(u.userId, u.role)
    };
    if (!usersRoles.has(req.user.id)) return res.status(404).send("Document not found");
    if (!usersRoles.has(userId)) return res.status(404).send("User not found");
    
    // validate role hierchy
    if(req.user.id !== userId && AVAILABLE_ROLES.indexOf(usersRoles.get(req.user.id)) >= AVAILABLE_ROLES.indexOf(usersRoles.get(userId))) {
      return res.status(400).send("Can not remove access to this user")
    } else if (AVAILABLE_ROLES.indexOf(usersRoles.get(req.user.id)) === 0) {
      return res.status(400).send("Must transer document ownership or delete")
    } else if (!PRIVILED_ROLES.includes(usersRoles.get(req.user.id)) && req.user.id !== userId) {
      return res.status(400).send("You can not remove access")
    }

    // remove user
    await prisma.userDocuments.delete({
      where: {
        userId_documentId: {
          userId,
          documentId: docId
        }
      }
    })
    res.status(204)
  } catch (error) {
    next(error)
  }
}

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  const docId = Number(req.params.docId)
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
    if(!user || user.role !== "OWNER") return res.status(404).send("Document not found");

    await prisma.document.delete({
      where: {
        id: docId
      }
    });
    res.status(204).send("deleted")
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
      { expiresIn: 60 * 15 } // 15min
    )

    res.status(201).json(wsToken)
  } catch (error) {
    next(error)    
  }
}
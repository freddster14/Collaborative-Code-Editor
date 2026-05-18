import { type NextFunction, type Request, type Response } from "express"
import { prisma } from "../../prisma/client.js";
import jwt from "jsonwebtoken";
import requireEnv from "../utils/env.js";
import { AVAILABLE_ROLES, PRIVILED_ROLES } from "../utils/constants.js";
import { Role } from "../../generated/prisma/enums.js";

export const createDoc = async (req: Request, res: Response, next: NextFunction) => {
  const folderId:number = Number(req.params.folderId);
  const name:string = req.body.name;
  try {
    //name required for creation
    if(name === "") return res.status(400).send("Document name required");

    // verify folder exists
    const folder: null | {documents: {name:string}[]} = await prisma.folder.findUnique({
      where: {
        id: folderId,
        userId: req.user.id      
      },
      select: {
        documents: {
          where: { name },
          select: { name:true}
        },
      },
    });
    if (!folder) return res.status(404).send("Folder not found");

    // verify document name does not exist within folder
    if (folder.documents.length > 0) return res.status(400).send("Name taken in folder")

    const document = await prisma.$transaction(async (prisma) => {
      const document = await prisma.document.create({
        data: {
          name,
          folderId,
        }
      });
      await prisma.userDocuments.create({
        data: {
          documentId: document.id,
          userId: req.user.id,
          role: "OWNER"
        }
      });
      return document
    })    

    res.status(201).json(document)
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
        document: {
          select: {
            id: true,
            name: true
          }
        }
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

export const myDocs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await prisma.userDocuments.findMany({
      where: {
        userId: req.user.id,
        role: Role.OWNER
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

export const sharedDocs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await prisma.userDocuments.findMany({
      where: {
        userId: req.user.id,
        role: { not: Role.OWNER }
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
  const id:number = Number(req.body.id);
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
    if (owner.role !== Role.OWNER) return res.status(404).send("Not able to change ownership");
    // verify selected user's ownership
    const newOwner: null | {role: Role, userId:number}= await prisma.userDocuments.findUnique({
      where: {
        id: id
      },
      select: {
        userId: true,
        role: true
      }
    });

    if (!newOwner) return res.status(404).send("User not found in document");
    if (newOwner.role !== Role.ADMIN) return res.status(403).send("Not able to be promoted");
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
          role: "ADMIN"
        }
      });
    });
    res.status(200).json({ msg: "Transfered"});
  } catch (error) {
    next(error)
  }
}

export const updateDoc = async (req: Request<{docId:string}, {}, {name:string}>, res: Response, next: NextFunction) => {
  const docId:number = Number(req.params.docId);
  const name  = req.body.name; 
  try {
    const document:{ folderId:number; users:{ role: Role }[] } | null = await prisma.document.findUnique({
      where: {
        id: docId,
        users: {
          some: {
            userId: req.user.id
          }
        }      
      },
      select: {
        folderId: true,
        users: {
          where: {
          userId: req.user.id
          },
          select: {
            role: true
          }
        }
      },
    });
    if (!document) return res.status(404).send("Document not found");
    if( !document.users[0] || !PRIVILED_ROLES.includes(document.users[0].role)) return res.status(403).send("No able to edit document");
    
    // verify document name does not exist within folder
    const doc = await prisma.document.count({
      where: {
        name,
        folderId: document.folderId
      },
    })
    if (doc > 0) return res.status(404).send("Name taken");

    const newDoc = await prisma.document.update({
      where: { id: docId },
      data: {
        name,
      }
    })

    res.status(200).json(newDoc);
  } catch (error) {
    next(error);
  }
}


export const getRoles = async (req:Request<{docId:string}>, res:Response, next:NextFunction) => {
  const docId:number = Number(req.params.docId);
  try {
    const user = await prisma.userDocuments.findUnique({
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
    if (!PRIVILED_ROLES.includes(user.role)) return res.status(400).send("Unable to view roles");
    const roles: Role[] = PRIVILED_ROLES.slice(0, PRIVILED_ROLES.indexOf(user.role) + 1)
    const userRoles = await prisma.userDocuments.findMany({
      where: {
        documentId: docId,
        role: { notIn: roles }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });

    res.status(200).json(userRoles)
  } catch (error) {
    next(error);
  }
}

export const getAdmins = async (req:Request<{docId:string}>, res:Response, next:NextFunction) => {
  const docId = Number(req.params.docId)
  try {
    // verify document exists & user is owner
    const user = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        },
      },
      select: {
        role: true
      }
    });
    if (!user) return res.status(404).send("Document not found");
    if (user.role !== Role.OWNER) return res.status(400).send("Not able to grab admins");

    const admins = await prisma.userDocuments.findMany({
      where: {
        documentId: docId,
        role: Role.ADMIN
      },
      select: {
        id:true,
        role: true,
        user: {
          select: {
            id:true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json(admins)

  } catch (error) {
    next(error)
  }
}


export const grantAccess = async (req: Request<{docId:string},{},{usersId:number[], roles:Role[]}>, res: Response, next: NextFunction) => {
  const usersId = req.body.usersId;
  const roles = req.body.roles;
  const docId:number = Number(req.params.docId);
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

    res.status(200).json({msg: "Granted"});
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
    res.status(200).json({ msg: "Updated" })
  } catch (error) {
    next(error)
  }
}

export const removeAccess = async (req:Request<{docId:string, id:string}>, res:Response, next:NextFunction) => {
  const docId = Number(req.params.docId);
  const id = Number(req.params.id);
  try {
    // grab user, user that'll be removed, and folderId
    const users = await prisma.userDocuments.findMany({
      where: {
          OR: [
            {
              userId: req.user.id,
              documentId: docId
            },
            { id }
          ]
        },
        select: {
          id: true,
          userId: true,
          role: true,
          document: {
            select: {
              folder: {
                select: {
                  userId: true,
                }
              }
            }
          }
        }
    });
    if (users.length === 0) return res.status(404).send("Document not found");

    const userMarked = users.find(u => u.id === id)
    const user = users.find(u => req.user.id === u.userId);
    
    if (!user) return res.status(404).send("Document not found");
    if (!userMarked) return res.status(404).send("User not found");
    
    // validate role hierchy
    if (req.user.id !== userMarked.userId) {
      if(!PRIVILED_ROLES.includes(user.role)) return res.status(400).send("You can not remove access")
      if (AVAILABLE_ROLES.indexOf(user.role) >= AVAILABLE_ROLES.indexOf(userMarked.role))  return res.status(400).send("Can not remove access to this user")
        
    } else if (req.user.id === userMarked.userId && userMarked.role === Role.OWNER) {
      return res.status(400).send("Must transer document ownership or delete")
    }

    // can not remove folder owner
    if (users[0]?.document.folder.userId === userMarked.userId) return res.status(400).send("Can not remove folder owner");

    // remove user
    await prisma.userDocuments.delete({
      where: {
        userId_documentId: {
          userId: userMarked.userId,
          documentId: docId
        }
      }
    })
    res.status(200).json({ msg: "removed" })
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
    const authorized = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId
        }
      },
      select: {
        role: true,
      }
    })

    // return page not found error
    if(!authorized) return res.status(404).send("Not authotorized/Page not found")
      
    const wsToken = jwt.sign(
      { id: docId, userId: req.user.id, username: req.user.username },
      requireEnv("SECRET"),
      { expiresIn: 60 * 15 } // 15min
    )

    res.status(201).json({ token: wsToken, role: authorized.role})
  } catch (error) {
    next(error)    
  }
}
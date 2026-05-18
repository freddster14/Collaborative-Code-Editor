import { type NextFunction, type Request, type Response } from "express"
import { prisma } from "../../prisma/client.js";
import { PRIVILED_ROLES } from "../utils/constants.js";

export const getUser = async (req: Request, res:Response) => {
  res.status(200).json(req.user)
}

export const searchUsersOnDoc = async (req:Request<{docId:string}, {}, {}, {search:string}>, res:Response, next:NextFunction) => {
  const docId = Number(req.params.docId);
  const query = req.query.search;
  try {

    // verify user's authorization
    const user = await prisma.userDocuments.findUnique({
      where: {
        userId_documentId: {
          userId: req.user.id,
          documentId: docId,
        }
      }, 
      select: {
        role: true,
      }
    });

    if (!user) return res.status(404).send("Document not found");
    if (!PRIVILED_ROLES.includes(user.role)) return res.status(400).send("Unable to add users");

    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
        username: {
          contains: query,
          mode: 'insensitive',
        },
        documents: {
          some: {
           NOT: {
            documentId: docId
           }
          }
        }
      },
      select: {
        id: true,
        username: true,
      }
    });
    res.status(200).json(users)
  } catch (error) {
    next(error);
  }
}
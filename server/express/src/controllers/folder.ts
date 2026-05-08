import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../prisma/client.ts";
import type { FolderCreateArgs } from "../../../generated/prisma/models.ts";

export const getFolder = async (req: Request, res: Response, next: NextFunction) => {
  const id:number = Number(req.params.id);
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id,
        userId: req.user.id
       },
      include: {
        documents: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: 'asc'
          }
        },
      }
    });

    if (!folder) return res.status(404).send("Folder not found");

    const childFolders = await prisma.folder.findMany({ where: { parentId: folder.id } });
    
    res.status(200).json({ folder, childFolders })
  } catch (error) {
    next(error);
  }
}

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.folder.findMany({
      where: {
        parentId: null,
        userId: req.user.id
      },
    });

    res.status(200).json({projects})
  } catch (error) {
    next(error);
  }
}

//validate
export const createFolder = async (req: Request<{}, {}, {name:string, parentId:string}>, res: Response, next: NextFunction) => {
  const { name, parentId } = req.body;
  try {
    const queryArgs: FolderCreateArgs = {
      data: {
        name,
        userId: req.user.id
      }
    }

    if (parentId) queryArgs.data.parentId = Number(parentId);

    const folder = await prisma.folder.create(queryArgs)
    res.status(201).json(folder)
  } catch (error) {
    next(error);
  }
}
// validate
export const updateFolder = async (req: Request, res: Response, next: NextFunction) => {
  const folderId: number = Number(req.params.folderId);
  const name:string = req.body.name;

  try {
    const folder:number = await prisma.folder.count({
       where: { id: folderId, userId: req.user.id }
    });

    if (folder === 0) return res.status(404).send("Folder not found");

    await prisma.folder.update({
      where: {
        id: folderId
      },
      data: {
        name
      }
    })
    res.status(200)
  } catch (error) {
    next(error)
  }
}

export const deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  const folderId: number = Number(req.params.folderId)
  try {
    const access = await prisma.folder.count({
      where: {
        id: folderId,
        userId: req.user.id
      }
    });
    if (access === 0) return res.status(404).send("Folder not found");

    await prisma.folder.delete({
      where: {
        id: folderId
      }
    })
  } catch (error) {
    next(error)
  }
}
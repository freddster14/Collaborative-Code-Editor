import type { NextFunction, Request, Response } from "express";
import { prisma, Prisma } from "@cce/prisma";

export const getFolder = async (req: Request, res: Response, next: NextFunction) => {
  const id:number = Number(req.params.id);
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id,
        userId: req.user.id
       },
      include: {
        folders: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
          orderBy: {
            name: 'asc'
          }
        },
        documents: {
          select: {
            id: true,
            name: true,
            users: {
              where: {
                userId: req.user.id
              },
              select: {
                role: true,
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        },
      }
    });

    if (!folder) return res.status(404).send("Folder not found");
    
    res.status(200).json(folder)
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
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(projects)
  } catch (error) {
    next(error);
  }
}

// add: validate name
export const createFolder = async (req: Request<{}, {}, {name:string, parentId:string}>, res: Response, next: NextFunction) => {
  const name = req.body.name;
  const parentId = Number(req.body.parentId);
  try {
    const queryArgs: Prisma.FolderCreateArgs = {
      data: {
        name,
        userId: req.user.id
      }
    }

    if (!Number.isNaN(parentId) && parentId > 0) {
      // verify parent folder exists & belongs to user
      const parent = await prisma.folder.count({
        where: {
          id: parentId,
          userId: req.user.id
        }
      })
      if(parent === 0) return res.status(404).send("Parent folder does not exist")
      // verify folder name does not exist within parent folder
      const folder = await prisma.folder.count({
        where: {
          userId: req.user.id,
          parentId,
          name
        },
      });
      if (folder > 0) return res.status(400).send("Name taken in folder");
      queryArgs.data.parentId = parentId;
    } else {
      // verify project name is not taken
      const folder = await prisma.folder.count({
        where: {
          userId: req.user.id,
          parentId: null,
          name,
        },
      });
      if (folder > 0) return res.status(400).send("Name taken in projects")
    }

    const folder = await prisma.folder.create(queryArgs)
    res.status(201).json(folder)
  } catch (error) {
    next(error);
  }
}
// add: validate name
export const updateFolder = async (req: Request<{id:string}, {}, {name:string}>, res: Response, next: NextFunction) => {
  const folderId = Number(req.params.id);
  const name = req.body.name;
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, userId: req.user.id },
      select: {
        parentId: true,
        parent: {
          select: {
            folders: {
              where: { name },
              select: { name: true }
            }
          }
        }
      }
    });
    if (!folder) return res.status(404).send("Folder not found");

    // verify folder name does not exist within parent folder
    if(folder.parent && folder.parent.folders.length > 0) {
      return res.status(400).send("Name taken in folder");
    } else {
      // verify name does not exists in projects
      const project = await prisma.folder.count({
        where: {
          userId: req.user.id,
          parentId: null,
          name
        }
      })
      if(project > 0) return res.status(400).send("Name taken in projects")
    }
    const newFolder = await prisma.folder.update({
      where: {
        id: folderId
      },
      data: {
        name
      }
    })
    res.status(200).json(newFolder)
  } catch (error) {
    next(error)
  }
}

export const deleteFolder = async (req: Request<{id:string}>, res: Response, next: NextFunction) => {
  const folderId: number = Number(req.params.id)
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

    res.status(204).send("deleted")
  } catch (error) {
    next(error)
  }
}
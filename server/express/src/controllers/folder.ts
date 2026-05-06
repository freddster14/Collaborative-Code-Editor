import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../prisma/client.ts";
import type { FolderCreateArgs } from "../../../generated/prisma/models.ts";

export const getFolder = async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
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

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
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
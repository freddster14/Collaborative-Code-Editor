import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../prisma/client.ts";
import type { FolderCreateArgs } from "../../../generated/prisma/models.ts";

export const getFolder = async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);

  try {
    const folder = await prisma.folder.findUnique({ where: { id }})
    if (!folder) return res.status(404).send("Folder not found");
    
    res.status(200).json(folder)
  } catch (error) {
    next(error);
  }
}

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
  const { name, parentId } = req.body;
  try {
    const queryArgs: FolderCreateArgs = {
      data: {
        name
      }
    }

    if (parentId) queryArgs.data.parentId = Number(parentId);

    const folder = await prisma.folder.create(queryArgs)

    res.status(201).json(folder)
  } catch (error) {
    next(error);
  }
}
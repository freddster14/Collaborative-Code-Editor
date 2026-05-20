import { prisma } from "./prisma/client";

export * from './generated/prisma/enums';
export type { FolderCreateArgs } from './generated/prisma/models'
export { prisma };
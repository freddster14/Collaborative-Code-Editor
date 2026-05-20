export class ApiError extends Error {
  msg: string;
  status: number;

  constructor( message: string, status: number) {
    super(message);
    this.msg = message
    this.status = status;
  }
}

export { type RoleType, Role,  type Document, type DocumentData } from "./types/document"
export type { ProjectData, FolderLoad } from "./types/folder"
export type { UserToken, UserRole, User, Admin } from "./types/user"
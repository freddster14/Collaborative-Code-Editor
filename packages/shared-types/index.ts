export class ApiError extends Error {
  msg: string;
  status: number;
  errors: ErrorType

  constructor( message: string, status: number, errors: ErrorType) {
    super(message);
    this.msg = message
    this.status = status;
    this.errors = errors
  }
}

export interface ErrorType {
  [key: string]: string
}

export { type RoleType, Role,  type Document, type DocumentData } from "./types/document.js"
export type { ProjectData, FolderLoad } from "./types/folder.js"
export type { UserTokenInfo, UserRole, User, Admin } from "./types/user.js"
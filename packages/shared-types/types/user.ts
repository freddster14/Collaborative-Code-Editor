import type { RoleType } from "./document.js";

export interface UserTokenInfo {
  id: number;
  username: string;
}

export interface UserTokenInfo {
  id: number;
  username: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  hashedPass: string
  createdAt: Date;
}

export interface UserRole {
  userId: number;
  username: string;
  role: RoleType;
}

export interface Admin {
  id: number,
  role: RoleType,
  user: {
    id: number,
    username: string,
  }
}
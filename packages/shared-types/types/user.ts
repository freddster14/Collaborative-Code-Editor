import type { RoleType } from "./document";

export interface UserToken {
  id: number;
  username: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
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
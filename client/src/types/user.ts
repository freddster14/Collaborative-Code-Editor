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
  role: string;
}

export interface Admin {
  id: number,
  role: string,
  user: {
    id: number,
    username: string,
  }
}
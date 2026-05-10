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
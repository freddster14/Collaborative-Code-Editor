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

export interface UserContextType {
  user: UserToken | null;
  loading: boolean;
  setUser: (user: UserToken | null) => void;
}
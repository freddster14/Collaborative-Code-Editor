export interface DocumentData {
  document: Document,
  id: number,
  userId: number,
  createdAt: Date,
  documentId: number,
  role: RoleType,
  viewAt: Date,
}

export interface Document {
  name: string;
  id: number;
}

export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  EDIT: 'EDIT',
  VIEW: 'VIEW'
} as const

export type RoleType = (typeof Role)[keyof typeof Role]
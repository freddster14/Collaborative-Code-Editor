import type { RoleType } from "./document";

export type ProjectData = {
  name: string;
  id: number;
  userId: number;
  parentId: number | null;
  createdAt: Date;
}

export type FolderLoad = ProjectData & {
  documents: {
    name: string;
    id: number;
    users: { role: RoleType }[];
  }[],
  folders: {
    name: string;
    id: number;
    userId: number;
  }[],
}

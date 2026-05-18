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
    users: { role: string }[];
  }[],
  folders: {
    name: string;
    id: number;
    userId: number;
  }[],
}

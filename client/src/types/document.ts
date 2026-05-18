export interface DocumentData {
  document: {
      name: string;
      id: number;
  },
  id: number,
  userId: number,
  createdAt: Date,
  documentId: number,
  role: string,
  viewAt: Date,
}
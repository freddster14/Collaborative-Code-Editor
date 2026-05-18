export interface DocumentData {
  document: Document,
  id: number,
  userId: number,
  createdAt: Date,
  documentId: number,
  role: string,
  viewAt: Date,
}

export interface Document {
  name: string;
  id: number;
}
export interface RemoveUserInfo {
  id: number,
  userId: number,
  role: string,
  document: {
    folder: {
      userId: number,
    }
  }
}
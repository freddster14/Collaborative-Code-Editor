export class ApiError extends Error {
  msg: string;
  status: number;

  constructor( message: string, status: number) {
    super(message);
    this.msg = message
    this.status = status;
  }
}
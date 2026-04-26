import { type ErrorRequestHandler } from "express";

const errorHandling:  ErrorRequestHandler =  (err, req, res, next) => {
  console.log(err.stack)
  res.status(500).json({ message: err.message });
}

export default errorHandling;
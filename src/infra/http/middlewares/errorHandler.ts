import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../core/errors/AppError";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal server error" });
}

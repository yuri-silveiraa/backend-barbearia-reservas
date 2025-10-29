import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../../../config/auth";

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token não fornecido" });

  const [ token ] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, authConfig.secret) as { userId: string };
    (req as any).user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../helpers/requestInterface";
import { env } from "../../../config/env";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";

export async function ensureBarber(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    const barberRepo = new PrismaBarberRepository();
    const barber = await barberRepo.findByUserId(decoded.userId);

    if (!barber) {
      return res.status(403).json({ message: "Acesso permitido apenas para barbeiros" });
    }

    req.user = { id: decoded.userId, barberId: barber.id, isAdmin: barber.isAdmin };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
}

export async function ensureAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    const barberRepo = new PrismaBarberRepository();
    const barber = await barberRepo.findByUserId(decoded.userId);

    if (!barber || !barber.isAdmin) {
      return res.status(403).json({ message: "Acesso permitido apenas para administradores" });
    }

    req.user = { id: decoded.userId, barberId: barber.id, isAdmin: barber.isAdmin };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
}

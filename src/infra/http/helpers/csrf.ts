import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production";
const COOKIE_NAME = "csrf-token";

export function generateCsrfToken(res: Response): string {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60,
  });
  return token;
}

export function validateCsrfToken(req: Request): boolean {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const headerToken = req.headers["x-csrf-token"] as string;

  if (!cookieToken || !headerToken) {
    return false;
  }

  return cookieToken === headerToken;
}

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const publicPaths = [
    "/user/login",
    "/user/create",
    "/user/google",
    "/csrf-token",
    "/barbers",
  ];

  const isPublicPath = publicPaths.some((path) => req.path.startsWith(path));
  const isPublicMethod = ["GET", "HEAD", "OPTIONS"].includes(req.method);

  if (isPublicPath || isPublicMethod) {
    return next();
  }

  if (!validateCsrfToken(req)) {
    return res.status(403).json({
      message: "Invalid CSRF token",
    });
  }

  next();
}

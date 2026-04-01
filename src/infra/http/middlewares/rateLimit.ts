import rateLimit from "express-rate-limit";
import type { Request } from "express";
import type { AuthenticatedRequest } from "../helpers/requestInterface";

export const appointmentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user?.id ?? req.ip;
  },
  message: {
    message: "Muitas requisições. Tente novamente em instantes.",
  },
});

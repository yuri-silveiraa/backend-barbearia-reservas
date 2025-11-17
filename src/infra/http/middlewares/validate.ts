import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {

    const result = schema.safeParse(req.body? req.body : req.params);
    
    if (!result.success) {
      return res.status(400).json({
        message: "Validação falhou",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    next();
  };

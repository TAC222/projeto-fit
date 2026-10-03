import type { NextFunction, Request, Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.status(401).json({ error: "Sessão inválida ou expirada. Inicia sessão novamente." });
  }
  next();
}

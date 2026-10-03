import type { NextFunction, Request, Response } from "express";

// Esta é a correção central da vulnerabilidade "qualquer sessão entra no /admin":
// o papel (role) vem sempre do registo do utilizador na base de dados
// (req.currentUser, carregado pelo attachUser a partir da sessão do servidor),
// nunca de um campo que o cliente possa escrever (ex: sessionStorage).
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.status(401).json({ error: "Sessão inválida ou expirada. Inicia sessão novamente." });
  }
  if (req.currentUser.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores." });
  }
  next();
}

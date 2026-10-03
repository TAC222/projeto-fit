import type { NextFunction, Request, Response } from "express";
import { findUserById, type UserRecord } from "../db";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserRecord;
    }
  }
}

// Corre em TODOS os pedidos. Nunca confia em nada que venha do cliente para
// decidir quem o utilizador é — só o id de sessão assinado pelo servidor
// (req.session.userId) é usado para ir buscar o registo real à base de dados.
export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  if (userId) {
    const user = findUserById(userId);
    if (user) {
      req.currentUser = user;
    } else {
      // Sessão aponta para um utilizador que já não existe (ex: apagado) — limpa-a.
      req.session.userId = undefined;
    }
  }
  next();
}

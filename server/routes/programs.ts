import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { programRequirements, tierMeets, ironbornFreeDaysLimit } from "../../shared/fitData";

const router = Router();

// Devolve só a decisão de acesso (não o conteúdo em si, que hoje é genérico/estático
// no cliente). Quando existir conteúdo real e valioso por trás disto (vídeos, PDFs de
// planos), o padrão é o mesmo: o cliente pede aqui, o servidor decide, e só então
// devolve o recurso (ou uma URL assinada e temporária para ele).
router.get("/", requireAuth, (req, res) => {
  const tier = req.currentUser!.tier;
  const unlocked: Record<string, boolean> = {};
  for (const [id, required] of Object.entries(programRequirements)) {
    unlocked[id] = tierMeets(tier, required);
  }
  res.json({ tier, unlocked, freeDaysLimit: ironbornFreeDaysLimit });
});

// Exemplo de rota "de conteúdo" — verifica sempre no servidor antes de dar acesso a
// um dia específico do programa Ironborn. Usar este padrão quando ligares ficheiros
// reais (PDF/vídeo) em vez de confiar em `locked` calculado no cliente.
router.get("/ironborn/day/:day", requireAuth, (req, res) => {
  const day = Number(req.params.day);
  if (!Number.isInteger(day) || day < 1 || day > 30) {
    return res.status(400).json({ error: "Dia inválido." });
  }
  const needsUpgrade = req.currentUser!.tier === "basic" && day > ironbornFreeDaysLimit;
  if (needsUpgrade) {
    return res.status(403).json({ error: "Este dia requer o plano Médio ou superior." });
  }
  res.json({ day, ok: true });
});

export default router;

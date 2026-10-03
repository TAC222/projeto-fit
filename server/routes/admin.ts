import { Router } from "express";
import { getInventory, incrementStock } from "../db";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// requireAdmin aplica-se a TODAS as rotas abaixo — é a correção do bug crítico em
// que qualquer sessão forjada no browser (sessionStorage) conseguia ver /admin.
// Agora, mesmo que alguém force a navegação para /admin no frontend, estes pedidos
// à API falham com 403 a menos que o utilizador seja mesmo admin na base de dados.
router.use(requireAdmin);

router.get("/overview", (_req, res) => {
  // Métricas de demonstração — substituir por agregações reais quando existir
  // uma base de clientes/vendas real.
  res.json({
    mrr: 24680,
    totalUsers: 1284,
    newSignupsThisMonth: 86,
    completedSessions: 8492,
    completionRate: 68.2,
  });
});

router.get("/workouts", (_req, res) => {
  res.json({
    workouts: [
      { id: "w1", title: "Ironborn / Dia 01", type: "PROGRAMA", owner: "Projeto Fit", pdf: "ironborn-dia-01.pdf", status: "Publicado" },
      { id: "w2", title: "Core em 12 minutos", type: "AVULSO", owner: "Projeto Fit", pdf: "core-12.pdf", status: "Publicado" },
      { id: "w3", title: "Summer Lean / Semana 02", type: "DESAFIO", owner: "Projeto Fit", pdf: "summer-lean-s02.pdf", status: "Rascunho" },
      { id: "w4", title: "Grounded / Dia 14", type: "PROGRAMA", owner: "Projeto Fit", pdf: "grounded-dia-14.pdf", status: "Publicado" },
    ],
  });
});

router.get("/inventory", (_req, res) => {
  res.json({ inventory: getInventory() });
});

router.post("/inventory/:id/increment", (req, res) => {
  const item = incrementStock(req.params.id);
  if (!item) return res.status(404).json({ error: "Produto não encontrado." });
  res.json({ item });
});

export default router;

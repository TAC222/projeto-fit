import { Router } from "express";
import { toPublicUser, updateUserTier } from "../db";
import { isValidTier } from "../auth/validate";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/upgrade", requireAuth, (req, res) => {
  const { tier } = req.body ?? {};
  if (!isValidTier(tier)) {
    return res.status(400).json({ error: "Plano inválido." });
  }

  // ⚠️ DEMO ONLY — este projeto ainda não tem um gateway de pagamento real ligado.
  //
  // EM PRODUÇÃO, esta rota NUNCA deve mudar o tier diretamente a partir de um pedido
  // do cliente como este. O fluxo correto é:
  //   1. O cliente inicia o checkout no gateway (Stripe Checkout, Escalapay, etc.)
  //   2. O gateway redireciona/webhook confirma o pagamento ao SERVIDOR, com uma
  //      assinatura que provas que veio mesmo do gateway (ex: verificação de
  //      assinatura HMAC do webhook).
  //   3. Só depois dessa confirmação assinada é que o servidor chama
  //      updateUserTier(). Nunca a partir de um POST que o próprio browser do
  //      cliente pode disparar livremente (como este endpoint faz agora).
  const user = updateUserTier(req.currentUser!.id, tier);
  if (!user) return res.status(404).json({ error: "Utilizador não encontrado." });

  res.json(toPublicUser(user));
});

export default router;

import { Router } from "express";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { env } from "../env";
import { findUserByEmail, updateUserTier } from "../db";
import type { Tier } from "../../shared/fitData";

const router = Router();

// Limite generoso (não é o login) — só para absorver picos/retries sem ficar exposto a spam.
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(webhookLimiter);

// Comparação em tempo constante — evita que alguém descubra o secret certo
// por tentativa-e-erro medindo o tempo de resposta.
function secretsMatch(expected: string, received: string): boolean {
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(received);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

// Eventos de pagamento costumam ser reenviados pelo gateway até receberem 200
// (ex: se a tua app esteve em deploy no momento). Guardamos os ids já tratados
// nesta execução para não aplicar o mesmo pagamento duas vezes.
// Nota: isto é só em memória — reinicia a zeros a cada deploy/restart. Para uma
// garantia forte contra duplicados a longo prazo, grava o id do evento no
// server/data/db.json (como já se faz com utilizadores/progresso) em vez de num Set.
const processedEventIds = new Set<string>();

function normalizeTier(raw: unknown): Tier | null {
  const value = String(raw ?? "").trim().toLowerCase();
  if (["basic", "básico", "basico"].includes(value)) return "basic";
  if (["medium", "médio", "medio", "mid"].includes(value)) return "medium";
  if (["premium"].includes(value)) return "premium";
  return null;
}

const PAID_STATUSES = ["paid", "completed", "success", "succeeded", "approved", "confirmed", "pago", "aprovado", "concluido", "concluído", "sucesso"];

router.post("/escalepay", (req, res) => {
  // 1) Verificação do Secret Token (cabeçalho X-Webhook-Secret), tal como
  // configurado no painel do Escalepay.
  const configuredSecret = env.escalepayWebhookSecret;
  if (configuredSecret) {
    const receivedSecret = req.header("X-Webhook-Secret") || "";
    if (!receivedSecret || !secretsMatch(configuredSecret, receivedSecret)) {
      console.warn("[webhook escalepay] pedido rejeitado — X-Webhook-Secret ausente ou inválido.");
      return res.status(401).json({ error: "Assinatura inválida." });
    }
  } else {
    // Isto já dispara um aviso no arranque do servidor (server/env.ts) — repetir
    // aqui por pedido ajuda a apanhar isto nos logs de produção também.
    console.warn("[webhook escalepay] AVISO: a processar pedido sem verificação de secret (ESCALEPAY_WEBHOOK_SECRET vazio).");
  }

  const payload = (req.body ?? {}) as Record<string, any>;

  // Regista sempre o payload em bruto. Isto é o mais importante para afinares o
  // mapeamento abaixo: não há documentação pública do Escalepay que eu tenha
  // conseguido confirmar, por isso os nomes de campo seguintes são uma tentativa
  // best-effort com variantes comuns noutros gateways. Dispara um pagamento de
  // teste a partir do painel do Escalepay, olha para esta linha nos logs do
  // Railway, e ajusta os nomes de campo abaixo para os que aparecerem de verdade.
  console.log("[webhook escalepay] payload recebido:", JSON.stringify(payload));

  // 2) Deduplicação — ignora reentregas do mesmo evento.
  const eventId = payload.id ?? payload.eventId ?? payload.event_id ?? payload.transactionId ?? payload.transaction_id;
  if (eventId && processedEventIds.has(String(eventId))) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  // 3) Confirma que é mesmo um evento de pagamento aprovado (não um "pendente"
  // ou "falhado" — ajusta a lista PAID_STATUSES acima se o Escalepay usar outros
  // valores).
  const status = String(payload.status ?? payload.event ?? payload.type ?? "").toLowerCase();
  if (!PAID_STATUSES.some((paid) => status.includes(paid))) {
    console.log(`[webhook escalepay] evento ignorado (status "${status}" não reconhecido como pagamento aprovado).`);
    return res.status(200).json({ received: true, ignored: true });
  }

  // 4) Identifica o utilizador — tenta por referência/metadata (se o checkout
  // enviar um identificador nosso) e cai para o email do pagador como alternativa.
  const reference = payload.reference ?? payload.metadata?.userId ?? payload.metadata?.reference ?? payload.orderId ?? payload.order_id;
  const email = payload.customer?.email ?? payload.email ?? payload.payer_email ?? payload.metadata?.email;

  const tier = normalizeTier(payload.tier ?? payload.plan ?? payload.metadata?.tier ?? payload.product);

  if (!tier) {
    console.error(
      `[webhook escalepay] AÇÃO NECESSÁRIA: pagamento aprovado mas não consegui identificar o plano (tier) a partir do payload. Ajusta normalizeTier()/os nomes de campo em server/routes/webhooks.ts. Payload acima.`,
    );
    return res.status(200).json({ received: true, applied: false, reason: "tier não identificado" });
  }

  const user = email ? findUserByEmail(email) : undefined;
  if (!user) {
    console.error(
      `[webhook escalepay] AÇÃO NECESSÁRIA: pagamento aprovado (ref: ${reference ?? "—"}, email: ${email ?? "—"}) mas não encontrei nenhuma conta Projeto Fit correspondente. Confirma que o checkout está a enviar o email certo, ou que a conta já existe antes do pagamento.`,
    );
    return res.status(200).json({ received: true, applied: false, reason: "utilizador não encontrado" });
  }

  updateUserTier(user.id, tier);
  if (eventId) processedEventIds.add(String(eventId));
  console.log(`[webhook escalepay] tier de ${user.email} atualizado para "${tier}".`);

  // Responder depressa com 200 é importante: a maioria dos gateways considera
  // "falhado" e volta a tentar (potencialmente duplicando o processamento) se
  // demorares demasiado ou devolveres um erro.
  res.status(200).json({ received: true, applied: true });
});

export default router;

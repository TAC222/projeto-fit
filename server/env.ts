import "dotenv/config";
import crypto from "node:crypto";

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

// SEGURANÇA: em produção o SESSION_SECRET TEM de vir de uma variável de ambiente
// fixa e secreta (nunca commitada). Sem isto, todas as sessões seriam assinadas
// com uma chave que muda a cada arranque do processo, e qualquer pessoa com
// acesso aos logs/processo poderia potencialmente forjar sessões se soubesse o valor.
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (isProduction) {
    throw new Error(
      "SESSION_SECRET não está definido. Define esta variável de ambiente antes de arrancar em produção (usa um valor aleatório longo, ex: `openssl rand -hex 32`).",
    );
  }
  // Em desenvolvimento, geramos um valor efémero só para não bloquear o arranque.
  // Isto invalida todas as sessões sempre que reinicias o servidor em dev — é esperado.
  sessionSecret = crypto.randomBytes(32).toString("hex");
  console.warn(
    "[AVISO] SESSION_SECRET não definido — a usar um valor aleatório temporário (só válido para esta execução). Define SESSION_SECRET num ficheiro .env antes de ires para produção.",
  );
}

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || (isProduction ? 3000 : 3001),
  sessionSecret,
  adminEmail: (process.env.ADMIN_EMAIL || "admin@projetofit.local").trim().toLowerCase(),
  // Em produção, exige-se uma password explícita — não há fallback previsível.
  adminPassword: process.env.ADMIN_PASSWORD || (isProduction ? "" : "TrocaEstaPassword123"),
};

if (env.isProduction && !env.adminPassword) {
  throw new Error(
    "ADMIN_PASSWORD não está definido. Define esta variável antes de arrancar em produção, para criar a conta de administrador inicial com uma password que só tu conheces.",
  );
}

// Fonte única de verdade para tipos e regras de acesso.
// Importado tanto pelo servidor (para aplicar as regras) como pelo cliente (para apresentação).
// SEGURANÇA: o cliente NUNCA deve ser a autoridade sobre estes valores — serve apenas para
// mostrar UI consistente. A decisão real de acesso é sempre recalculada no servidor.

export type Tier = "basic" | "medium" | "premium";
export type Role = "user" | "admin";

export const tierRank: Record<Tier, number> = {
  basic: 1,
  medium: 2,
  premium: 3,
};

export function tierMeets(userTier: Tier, required: Tier): boolean {
  return tierRank[userTier] >= tierRank[required];
}

// Programas "premium" (deep programs). O id é a chave partilhada entre
// client/src/lib/fitData.ts (apresentação: título, imagem, descrição) e o
// servidor (decide se está desbloqueado). Adicionar um programa novo = adicionar
// aqui a exigência de tier, e no cliente os dados de apresentação.
export const programRequirements: Record<string, Tier> = {
  p1: "medium", // Ironborn
  p2: "medium", // Grounded
};

// A partir de que dia do plano Ironborn (1-30) é necessário tier >= medium.
export const ironbornFreeDaysLimit = 7;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  role: Role;
}

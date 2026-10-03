/* STYLE: Laboratório Solar — dados de produto com linguagem operacional, preços claros e sinais de progressão. */
import type { PublicUser, Tier } from "@shared/fitData";

export type { Tier };
// A sessão do cliente é sempre uma cópia do que o servidor devolveu
// (registo/login/me/upgrade) — nunca um objeto construído localmente.
export type Session = PublicUser;

export type Plan = {
  id: Tier;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
};

export const assets = {
  mark: "/manus-storage/projeto-fit-mark_0f5b2a13.png",
  hero: "/manus-storage/projeto-fit-hero_faf27f4d.png",
  home: "/manus-storage/projeto-fit-home_a54f0394.png",
  gym: "/manus-storage/projeto-fit-gym_1845c137.png",
};

export const plans: Plan[] = [
  {
    id: "basic",
    name: "BÁSICO",
    price: "9,99€",
    description: "Para começar sem ruído.",
    features: ["Treinos avulsos", "Plano semanal com IA", "Biblioteca essencial"],
  },
  {
    id: "medium",
    name: "MÉDIO",
    price: "19,99€",
    description: "O equilíbrio que funciona.",
    features: ["Casa + academia", "Desafios rápidos", "FitBot completo", "Histórico e evolução"],
    popular: true,
  },
  {
    id: "premium",
    name: "PREMIUM",
    price: "29,99€",
    description: "Para levar mais longe.",
    features: ["Tudo do plano Médio", "Programas Ironborn", "Protocolos avançados", "Acesso antecipado"],
  },
];

export const tierLabel: Record<Tier, string> = {
  basic: "Básico",
  medium: "Médio",
  premium: "Premium",
};

export { tierRank } from "@shared/fitData"; // fonte única de verdade (também usada pelo servidor)

export const workoutExercises = [
  { name: "Agachamento goblet", detail: "4 séries · 10 repetições", cue: "Mantém o peito aberto." },
  { name: "Remada unilateral", detail: "3 séries · 12 por lado", cue: "Puxa o cotovelo para trás." },
  { name: "Press de ombros", detail: "3 séries · 10 repetições", cue: "Expira na subida." },
  { name: "Prancha ativa", detail: "3 séries · 35 segundos", cue: "Costelas para dentro, respira." },
];

export const products = [
  { id: "whey", name: "Whey Isolado", category: "RECUPERAÇÃO", price: "34,90€", description: "Baunilha · 900 g", accent: "orange" },
  { id: "creatine", name: "Creatina Pure", category: "PERFORMANCE", price: "24,90€", description: "Monohidratada · 300 g", accent: "cream" },
  { id: "glutamine", name: "Glutamina", category: "RECUPERAÇÃO", price: "19,90€", description: "Sem sabor · 300 g", accent: "green" },
  { id: "burner", name: "Burn Protocol", category: "ENERGIA", price: "27,90€", description: "60 cápsulas · cafeína", accent: "red" },
];

export const quickWorkouts = [
  { id: "q1", title: "Core em 12 minutos", level: "Todos os níveis", meta: "12 MIN · SEM EQUIPAMENTO", image: assets.home },
  { id: "q2", title: "Força de base", level: "Nível intermédio", meta: "24 MIN · HALTERES", image: assets.gym },
  { id: "q3", title: "Mobilidade pós-dia", level: "Recuperação", meta: "15 MIN · FLOW", image: assets.hero },
];

export const challenges = [
  { id: "c1", title: "Reset 15", duration: "15 dias", focus: "Consistência & energia", tone: "orange" },
  { id: "c2", title: "Summer Lean", duration: "21 dias", focus: "Força & composição", tone: "cream" },
  { id: "c3", title: "Iron Discipline", duration: "30 dias", focus: "Rotina avançada", tone: "red" },
];

export const deepPrograms = [
  { id: "p1", title: "Ironborn", context: "Academia", duration: "30 dias", detail: "Força · Hipertrofia", image: assets.gym, required: "medium" as Tier },
  { id: "p2", title: "Grounded", context: "Casa", duration: "30 dias", detail: "Controlo · Corpo inteiro", image: assets.home, required: "medium" as Tier },
];

import type { PublicUser, Tier } from "@shared/fitData";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: "include", // envia/recebe o cookie de sessão HttpOnly
    headers: {
      "Content-Type": "application/json",
      // Mitigação simples de CSRF: pedidos de outras origens feitos por um
      // <form> normal não conseguem definir este header customizado.
      "X-Requested-With": "fetch",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // resposta sem corpo JSON — ok para 204, por exemplo
    }
  }

  if (!response.ok) {
    const message = (data as { error?: string } | null)?.error || "Ocorreu um erro. Tenta novamente.";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export interface ProgramsAccess {
  tier: Tier;
  unlocked: Record<string, boolean>;
  freeDaysLimit: number;
}

export interface AdminOverview {
  mrr: number;
  totalUsers: number;
  newSignupsThisMonth: number;
  completedSessions: number;
  completionRate: number;
}

export interface AdminWorkout {
  id: string;
  title: string;
  type: string;
  owner: string;
  pdf: string;
  status: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
}

export const api = {
  register: (body: { name: string; email: string; password: string; tier?: Tier }) =>
    request<PublicUser>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<PublicUser>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request<void>("/api/auth/logout", { method: "POST" }),

  me: () => request<PublicUser>("/api/auth/me"),

  upgrade: (tier: Tier) => request<PublicUser>("/api/user/upgrade", { method: "POST", body: JSON.stringify({ tier }) }),

  programs: () => request<ProgramsAccess>("/api/programs"),

  progress: () => request<{ completedDays: number[] }>("/api/progress"),

  toggleProgress: (day: number) =>
    request<{ completedDays: number[] }>("/api/progress/toggle", { method: "POST", body: JSON.stringify({ day }) }),

  adminOverview: () => request<AdminOverview>("/api/admin/overview"),

  adminWorkouts: () => request<{ workouts: AdminWorkout[] }>("/api/admin/workouts"),

  adminInventory: () => request<{ inventory: InventoryItem[] }>("/api/admin/inventory"),

  incrementStock: (id: string) =>
    request<{ item: InventoryItem }>(`/api/admin/inventory/${encodeURIComponent(id)}/increment`, { method: "POST" }),
};

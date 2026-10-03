import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { hashPassword } from "./auth/hash";
import { env } from "./env";
import type { PublicUser, Role, Tier } from "../shared/fitData";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

export interface UserRecord {
  id: string;
  name: string;
  email: string; // sempre em minúsculas — é a chave de unicidade
  passwordHash: string;
  tier: Tier;
  role: Role;
  createdAt: string;
}

export interface ProgressRecord {
  userId: string;
  completedDays: number[];
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
}

interface DbShape {
  users: UserRecord[];
  progress: ProgressRecord[];
  inventory: InventoryItem[];
}

function defaultDb(): DbShape {
  return {
    users: [
      {
        id: crypto.randomUUID(),
        name: "Administrador",
        email: env.adminEmail,
        passwordHash: hashPassword(env.adminPassword || crypto.randomBytes(9).toString("base64url")),
        tier: "premium",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    ],
    progress: [],
    inventory: [
      { id: "whey", name: "Whey Protein", stock: 42 },
      { id: "creatine", name: "Creatina", stock: 28 },
      { id: "glutamine", name: "Glutamina", stock: 16 },
      { id: "burner", name: "Fat Burner", stock: 9 },
    ],
  };
}

let cache: DbShape | null = null;

function load(): DbShape {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const fresh = defaultDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2), "utf-8");
    console.log(
      `[SETUP] Base de dados inicial criada com conta de administrador: ${env.adminEmail} (password definida em ADMIN_PASSWORD/.env). Muda a password assim que entrares.`,
    );
    cache = fresh;
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as DbShape;
  return cache;
}

// Escrita síncrona: evita condições de corrida entre pedidos concorrentes
// (aceitável à escala de um protótipo; substituir por uma base de dados real
// — Postgres/SQLite — antes de escalar para múltiplas instâncias do servidor).
function persist() {
  if (!cache) return;
  fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

export function toPublicUser(user: UserRecord): PublicUser {
  return { id: user.id, name: user.name, email: user.email, tier: user.tier, role: user.role };
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return load().users.find((u) => u.email === normalized);
}

export function findUserById(id: string): UserRecord | undefined {
  return load().users.find((u) => u.id === id);
}

export function createUser(input: { name: string; email: string; password: string }): UserRecord {
  const db = load();
  const user: UserRecord = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: hashPassword(input.password),
    tier: "basic",
    role: "user",
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  persist();
  return user;
}

export function updateUserTier(userId: string, tier: Tier): UserRecord | undefined {
  const db = load();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return undefined;
  user.tier = tier;
  persist();
  return user;
}

export function getProgress(userId: string): number[] {
  const db = load();
  return db.progress.find((p) => p.userId === userId)?.completedDays ?? [];
}

export function toggleProgressDay(userId: string, day: number): number[] {
  const db = load();
  let record = db.progress.find((p) => p.userId === userId);
  if (!record) {
    record = { userId, completedDays: [] };
    db.progress.push(record);
  }
  const idx = record.completedDays.indexOf(day);
  if (idx >= 0) record.completedDays.splice(idx, 1);
  else record.completedDays.push(day);
  record.completedDays.sort((a, b) => a - b);
  persist();
  return record.completedDays;
}

export function getInventory(): InventoryItem[] {
  return load().inventory;
}

export function incrementStock(itemId: string): InventoryItem | undefined {
  const db = load();
  const item = db.inventory.find((i) => i.id === itemId);
  if (!item) return undefined;
  item.stock += 1;
  persist();
  return item;
}

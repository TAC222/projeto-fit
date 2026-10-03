const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_RE.test(value.trim());
}

export function isValidName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 80;
}

// Mínimo 8 caracteres, com pelo menos uma letra e um número.
// (Consistente com o texto mostrado no formulário — antes dizia "mínimo 8" mas
// só validava 6 no cliente e nada no servidor.)
export function isValidPassword(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length < 8 || value.length > 200) return false;
  return /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

export function isValidTier(value: unknown): value is "basic" | "medium" | "premium" {
  return value === "basic" || value === "medium" || value === "premium";
}

export function isValidDay(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 30;
}

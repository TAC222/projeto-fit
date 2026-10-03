import { Router } from "express";
import { createUser, findUserByEmail, toPublicUser, updateUserTier } from "../db";
import { verifyPassword } from "../auth/hash";
import { isValidEmail, isValidName, isValidPassword, isValidTier } from "../auth/validate";
import { requireAuth } from "../middleware/requireAuth";
import { COOKIE_NAME } from "../../shared/const";

const router = Router();

router.post("/register", (req, res) => {
  const { name, email, password, tier } = req.body ?? {};

  if (!isValidName(name)) {
    return res.status(400).json({ error: "Nome inválido (mínimo 2 caracteres)." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Email inválido." });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "A password precisa de pelo menos 8 caracteres, com letras e números." });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "Já existe uma conta com este email." });
  }

  const user = createUser({ name, email, password });

  // DEMO: sem gateway de pagamento real ligado ainda. Toda a conta nasce em "basic";
  // se o utilizador escolheu um plano pago no formulário, simulamos aqui o "pagamento
  // aprovado" só para efeitos de demonstração.
  //
  // EM PRODUÇÃO: substituir este bloco por uma verificação real — o tier só deve
  // mudar quando um webhook assinado do gateway de pagamento (Stripe/Escalapay/etc.)
  // confirmar o pagamento, nunca a partir de um campo enviado directamente pelo
  // cliente neste pedido.
  let finalUser = user;
  if (isValidTier(tier) && tier !== "basic") {
    finalUser = updateUserTier(user.id, tier) ?? user;
  }

  req.session.userId = finalUser.id;
  res.status(201).json(toPublicUser(finalUser));
});

router.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};

  if (!isValidEmail(email) || typeof password !== "string" || !password) {
    // Mensagem genérica de propósito — não confirmar se foi o email ou a password que falhou.
    return res.status(401).json({ error: "Email ou password incorretos." });
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Email ou password incorretos." });
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Não foi possível iniciar sessão. Tenta novamente." });
    req.session.userId = user.id;
    res.json(toPublicUser(user));
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie(COOKIE_NAME);
    res.status(204).end();
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json(toPublicUser(req.currentUser!));
});

export default router;

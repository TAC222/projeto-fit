import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import session from "express-session";
import FileStoreFactory from "session-file-store";
import rateLimit from "express-rate-limit";
import { env } from "./env";
import { attachUser } from "./middleware/attachUser";
import { COOKIE_NAME } from "../shared/const";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import programsRoutes from "./routes/programs";
import progressRoutes from "./routes/progress";
import adminRoutes from "./routes/admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FileStore = FileStoreFactory(session);

async function startServer() {
  const app = express();
  // Necessário para que `secure: true` nos cookies e o rate limiting por IP
  // funcionem corretamente atrás de um proxy/load balancer (Render, Fly, etc.).
  app.set("trust proxy", 1);

  const server = createServer(app);

  // Cabeçalhos de segurança HTTP (X-Content-Type-Options, HSTS, etc.).
  // CSP fica desativada por agora porque a app ainda não tem uma lista fechada
  // de domínios externos (mapas, analytics) — ativar com uma política explícita
  // antes de ires para produção.
  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(express.json({ limit: "100kb" }));

  app.use(
    session({
      name: COOKIE_NAME,
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new FileStore({
        path: path.join(__dirname, "..", ".sessions"),
        logFn: () => {}, // silencia logs internos de rotina da livraria (limpeza periódica de sessões expiradas)
      }),
      cookie: {
        httpOnly: true, // inacessível a JavaScript no browser — mitiga roubo de sessão via XSS
        // ⚠️ IMPORTANTE PARA O DEPLOY: com secure:true, o express-session só envia o
        // cookie quando deteta HTTPS real (via req.secure, que depende de "trust proxy"
        // + o header X-Forwarded-Proto vindo do teu proxy/plataforma de hosting).
        // A generalidade das plataformas (Render, Railway, Fly.io, Vercel, nginx com
        // TLS, etc.) já envia esse header corretamente — mas se fizeres deploy atrás de
        // um proxy que NÃO o envie, o login vai "funcionar" (200 OK) mas a sessão nunca
        // fica guardada, e a app parece quebrada. Testa sempre login logo após o deploy.
        secure: env.isProduction,
        sameSite: "lax", // mitigação base contra CSRF
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      },
    }),
  );

  // Carrega req.currentUser a partir da sessão do servidor (nunca do cliente).
  app.use(attachUser);

  // Limita tentativas de login/registo por IP — mitigação básica contra força bruta.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas tentativas. Aguarda uns minutos e tenta novamente." },
  });
  app.use(["/api/auth/login", "/api/auth/register"], authLimiter);

  // Rotas da API — têm de vir ANTES do catch-all "*" que serve o index.html,
  // senão qualquer pedido a /api/... seria "engolido" pelo SPA fallback.
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/programs", programsRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", (_req, res) => res.status(404).json({ error: "Rota da API não encontrada." }));

  // Serve os ficheiros estáticos do build em produção
  const staticPath =
    env.nodeEnv === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all remaining routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  server.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}/`);
  });
}

startServer().catch(console.error);

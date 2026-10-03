export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// A função getLoginUrl() (OAuth contra o portal da Manus, com um "state" de CSRF
// previsível — só base64 do redirectUri, não um nonce aleatório) foi removida daqui:
// era um resto do template, nunca chegou a ser chamada em lado nenhum da app, e a
// autenticação real da app agora vive em server/routes/auth.ts (email/password +
// sessão no servidor). Ver AUDITORIA_SEGURANCA_PROJETO_FIT.md para o registo do
// achado original.

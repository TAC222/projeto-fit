# Projeto Fit

App de treino (React + Vite no frontend, Express no backend) com autenticação real, planos por tier e um painel de administração — tudo protegido no servidor.

Este README cobre só o essencial para pores o projeto a correr. Para o histórico da auditoria de segurança e o que foi corrigido, vê `AUDITORIA_SEGURANCA_PROJETO_FIT.md` e `TECHNICAL_AUDIT.md`.

## Arrancar em desenvolvimento

```bash
pnpm install
cp .env.example .env
```

Edita o `.env` e preenche pelo menos `SESSION_SECRET` (gera um com `openssl rand -hex 32`). Em desenvolvimento, se deixares em branco, o servidor gera um valor temporário sozinho — só não persiste entre reinícios.

```bash
pnpm dev
```

Isto arranca o Vite (frontend, porta 3000 por definição) e a API Express (porta 3001) em simultâneo, com o Vite a encaminhar `/api/*` para a API. Abre `http://localhost:3000`.

Na primeira vez que a API arranca, cria automaticamente uma conta de administrador com o email/password definidos em `ADMIN_EMAIL`/`ADMIN_PASSWORD` no `.env` (por omissão em dev: `admin@projetofit.local` / `TrocaEstaPassword123`). **Muda essa password assim que entrares.**

## Build e arranque em produção

```bash
pnpm build
pnpm start
```

`pnpm start` corre o servidor Express já compilado (`dist/index.js`), que serve a API **e** os ficheiros estáticos do frontend na mesma porta (`PORT`, por omissão 3000).

Antes de fazeres deploy real:

1. Define `SESSION_SECRET` e `ADMIN_PASSWORD` como variáveis de ambiente do teu serviço de hosting (nunca num ficheiro `.env` commitado). Sem `SESSION_SECRET`, o servidor recusa-se a arrancar em produção — de propósito.
2. Confirma que a tua plataforma de hosting/proxy envia o cabeçalho `X-Forwarded-Proto: https` (a esmagadora maioria já faz isto por definição atrás de TLS — Render, Railway, Fly.io, nginx com HTTPS, etc.). Sem isso, o cookie de sessão (`Secure`) nunca é enviado e o login parece "funcionar" mas ninguém fica autenticado. **Testa sempre um login real logo a seguir ao deploy.**
3. A base de dados atual é um ficheiro JSON em `server/data/db.json`, criado automaticamente. Funciona bem para uma instância única; se algum dia escalares para múltiplas instâncias do servidor atrás de um load balancer, migra para Postgres/MySQL/Mongo antes disso (o ficheiro JSON não é partilhado entre processos).

## Onde entra o pagamento real

`POST /api/webhooks/escalepay` recebe notificações da Escalepay e exige o cabeçalho `X-Webhook-Secret` quando `ESCALEPAY_WEBHOOK_SECRET` está configurado. Em produção, essa variável é obrigatória. A rota atualiza o plano com base nos campos de pagamento recebidos; confirma os nomes/formato dos campos com a documentação da Escalepay antes de processar pagamentos reais. `POST /api/user/upgrade` continua a ser apenas uma simulação para demonstração e não deve ser usado para pagamentos reais.

## Estrutura

- `client/` — frontend React/Vite.
- `server/` — API Express (auth, sessões, admin, progresso, programas).
- `shared/` — tipos e regras (tiers, permissões) partilhados entre cliente e servidor, para nunca haver duas fontes de verdade a divergir.

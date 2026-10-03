# Auditoria técnica do Projeto Fit

## Atualização de segurança (Setembro 2026)

Esta secção substitui as conclusões abaixo sobre autenticação e autorização — mantemos o resto do documento como registo histórico do estado anterior.

O projeto passou a ter um **backend real** (`server/`), com testes de ataque feitos e documentados (ver PDF/resumo entregue ao proprietário). Resumo do que mudou:

- **Autenticação real**: password com hash `bcrypt`, nunca guardada nem comparada em texto simples.
- **Sessão no servidor**: cookie `HttpOnly` + `SameSite=Lax` + `Secure` em produção, persistida em `session-file-store` (não é mais `sessionStorage` do browser). Ver nota sobre `X-Forwarded-Proto` em `server/index.ts` antes de fazer deploy atrás de um proxy.
- **Autorização real**: `/admin` e todas as rotas `/api/admin/*` exigem `role === "admin"` verificado no servidor (`server/middleware/requireAdmin.ts`), nunca inferido de dados enviados pelo cliente.
- **Atualização de plano via webhook**: `/api/webhooks/escalepay` aceita notificações com `X-Webhook-Secret` configurado por `ESCALEPAY_WEBHOOK_SECRET` (obrigatório em produção). A validação atual usa um segredo partilhado, não uma assinatura criptográfica do payload; confirma o formato e o método de autenticação oficiais da Escalepay antes de processar pagamentos reais. `/api/user/upgrade` continua a ser uma simulação de demonstração.
- **Progresso do utilizador** (dias concluídos) passou de `localStorage` para o servidor, associado ao utilizador autenticado.
- **Rate limiting** em `/api/auth/login` e `/api/auth/register` (20 pedidos / 15 min por IP) e cabeçalhos de segurança via `helmet`.

Testado com ataques reais (sessão forjada, cookie aleatório, password fraca, acesso direto a rotas de admin sem privilégio) — ver secção de testes no histórico da conversa com o Claude / `server/`.

## Escopo e correção do diagnóstico (estado anterior — pré-backend)

Este documento incorpora a avaliação anexada e corrige a sua leitura para o estado *anterior* do projeto, antes da introdução do backend acima. Ficou registado por transparência histórica.

| Área | Observação corrigida | Estado atual | Próxima ação de produção |
| --- | --- | --- | --- |
| Sessão | A aplicação não usa cookie de sessão: usa `sessionStorage` para uma sessão simulada, sem dados sensíveis. | **Resolvido** — cookie de sessão real no servidor (ver secção acima). | Configurar corretamente `X-Forwarded-Proto` na plataforma de hosting. |
| Rotas privadas | `/dashboard` e `/admin` tinham gating visual e fallback para autenticação, mas isso não constituía autorização real. | **Resolvido** — autorização aplicada no servidor (`requireAuth`/`requireAdmin`); o gating no cliente é só UX. | Adicionar testes automatizados (ex: Playwright) que tentem contornar isto em CI. |
| Assets internos | O plugin de build remove ficheiros em `__manus__/` do bundle de produção, mantendo o suporte de debug em desenvolvimento. | Corrigido em `vite.config.ts`. | Confirmar o conteúdo do artefacto publicado no pipeline de CI/CD. |
| SEO e partilha | O HTML base recebeu descrição, Open Graph, Twitter Cards e uma fallback `noscript`. | Melhorado no frontend. | Usar SSG/SSR se a aquisição orgânica e o LCP da landing forem requisitos comerciais prioritários. |
| Bundle inicial | Auth, dashboard e admin passaram a ser carregados com `lazy()`; a landing permanece imediata. | Corrigido em `App.tsx`. | Medir LCP/FCP e dividir componentes adicionais conforme dados reais. |
| Dados e preços | `fitData.ts` contém dados mock locais para catálogo/apresentação (preços, imagens, textos) — não sensíveis. O que é sensível (tier real, stock, progresso) já vive no servidor. | Parcialmente mantido, de forma deliberada (ver acima). | Mover catálogo/preços para uma base de dados real com painel de edição quando o catálogo crescer. |
| Componentes Shadcn | A presença de componentes não usados no template não cria, por si só, código executado no bundle. A remoção em massa aumentaria o risco de quebrar imports futuros. | Mantidos; apenas os usados são importados pelas views. | Fazer uma limpeza guiada por análise de dependências antes de um release de produção. |

## Decisões aplicadas

A sessão passou de `sessionStorage` para um cookie de sessão real validado no servidor; a proteção de `/admin` e do tier de plano deixou de ser apenas UX e passou a ser aplicada no backend; os assets internos de debug continuam filtrados no build de produção; o carregamento de views privadas continua diferido. Os metadados da landing e a fallback sem JavaScript mantêm-se.

## Limites conhecidos

Ainda não existe: gateway de pagamentos real (o ponto de integração está isolado e comentado em `server/routes/user.ts`), base de dados relacional (usa-se um ficheiro JSON — adequado a esta escala, não a múltiplas instâncias do servidor), Content-Security-Policy explícita (`helmet` está ativo mas com CSP desligada até se fechar a lista de domínios externos), CMS persistente para o conteúdo dos treinos, nem integração real com Gemini/IA para o FitBot (continua com respostas pré-escritas). Estes pontos devem ser resolvidos antes de qualquer uso comercial com dinheiro real de clientes.

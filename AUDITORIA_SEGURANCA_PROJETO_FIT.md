# Auditoria de Segurança — Projeto Fit

**Escopo analisado:** código-fonte completo do zip enviado (`client/`, `server/`, `shared/`, configs).
**Metodologia:** revisão de código (SAST manual) + reconstrução e execução de PoCs da lógica real de autenticação/autorização + `pnpm audit` às dependências.
**Veredito em uma frase:** hoje isto é uma **maquete visual (frontend-only)** sem backend, sem base de dados e sem pagamento real — o que é normal numa fase de protótipo, mas significa que **zero controlos de segurança atuais resistem a um utilizador com o DevTools aberto**. O próprio repositório já assume isto (`TECHNICAL_AUDIT.md`), o que é honesto — mas vale confirmar com PoCs concretas para saberes exatamente o que corrigir antes de ligar dinheiro/dados reais a isto.

---

## 1. Achado estrutural (a raiz de quase tudo)

`server/index.ts` é só um servidor de ficheiros estáticos:

```ts
app.use(express.static(staticPath));
app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));
```

Não há rotas de API, não há base de dados, não há verificação de password, não há sessão de servidor. **Toda a "conta", "plano pago" e "admin" vivem só no browser da pessoa**, num objeto JSON dentro de `sessionStorage`. Isto não é um bug isolado — é a causa de quase todas as vulnerabilidades abaixo, por isso trato-o à parte antes da lista.

---

## 2. Vulnerabilidades encontradas (por risco)

### 🔴 CRÍTICO — Autenticação totalmente falsa
**Onde:** `client/src/pages/AuthPage.tsx`

```ts
const submit = (event: FormEvent) => {
  event.preventDefault();
  onComplete({ name: name.trim() || "Atleta Fit", email: email.trim() || "atleta@projetofit.pt", tier });
};
```

A password é capturada num `useState` mas **nunca é usada, validada ou enviada para lado nenhum**. Escreve-se qualquer email + qualquer password (mesmo vazio, mesmo "123") e entra-se. O tipo `Session` nem sequer tem campo de password ou de ID de utilizador:

```ts
export type Session = { name: string; email: string; tier: Tier };
```

**Impacto:** neste momento não existe "conta" nenhuma para proteger — mas é o padrão que vai ser copiado quando ligarem um backend a sério, e é preciso partir do zero aqui.

---

### 🔴 CRÍTICO — Qualquer sessão acede ao painel de Admin
**Onde:** `client/src/App.tsx`, rota `/admin`

```tsx
<Route path="/admin">
  {session ? <Admin session={session} .../> : <AuthPage .../>}
</Route>
```

A única condição é `session` existir. **Não há campo `role`, `isAdmin` ou equivalente em lado nenhum do código.** Ou seja: qualquer pessoa que crie uma "conta" (o que demorámos 2 segundos a fazer na secção anterior, sem pagar nada) navega diretamente para `projetofit.pt/admin` e vê MRR, número de utilizadores totais, tabela de conteúdo e inventário da loja.

**PoC (correu no sandbox, replicando 1:1 a lógica real):**
```
Cenário 1: cliente pagou o plano BÁSICO
  Acesso a /admin: PERMITIDO (!)
```
Ficheiro `poc-exploit-session.mjs` anexo — pode correr com `node poc-exploit-session.mjs`.

**Impacto quando isto for produto real:** exposição de métricas de negócio (MRR, base de clientes) e de operações de gestão de conteúdo/stock a qualquer cliente pagante ou não-pagante.

---

### 🔴 CRÍTICO — Bypass do plano pago (Básico/Médio/Premium) via DevTools
**Onde:** `client/src/App.tsx` (`readSession`) + `client/src/pages/Dashboard.tsx`

```ts
function readSession(): Session | null {
  const stored = sessionStorage.getItem(SESSION_KEY);
  return stored ? (JSON.parse(stored) as Session) : null;
}
```
```ts
{tierRank[session.tier] >= tierRank[program.required] ? <Continuar/> : <Desbloquear/>}
```

O "plano" da pessoa é só uma string dentro de um JSON no `sessionStorage`, sem assinatura nem verificação. Um cliente do plano Básico (9,99€) abre a consola do browser e corre:

```js
sessionStorage.setItem("projeto-fit-session",
  JSON.stringify({ name: "x", email: "x@x.com", tier: "premium" }));
```
...recarrega a página, e passa a ter acesso Premium (29,99€) completo, incluindo o FitBot sem paywall.

**PoC executada:**
```
Cenário 2: mesmo utilizador, ataque via DevTools (Console)
  Acesso a "Ironborn" (requer medium): LIBERADO (bypass confirmado)
  Acesso a "Grounded" (requer medium): LIBERADO (bypass confirmado)
```

**Impacto:** perda de receita direta assim que existir pagamento real — qualquer cliente pode "upgradar-se" a si próprio sem pagar.

---

### 🟠 ALTO — Nenhuma decisão sensível pode ser confiada ao cliente (raiz das 2 anteriores)
Isto é o princípio geral por trás dos dois pontos acima, e importa nomeá-lo separadamente porque **vai continuar a acontecer com qualquer feature nova** enquanto não houver backend: dados de sessão, tier, e permissões de admin têm de ser validados no servidor a cada pedido — nunca confiados a algo que o browser da pessoa controla (`sessionStorage`, `localStorage`, cookies não assinados, parâmetros de URL, campos escondidos no HTML).

---

### 🟠 ALTO — Chave de API exposta no bundle do cliente (código morto, mas ativável por engano)
**Onde:** `client/src/components/Map.tsx`

```ts
const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}...`;
```

Qualquer variável com prefixo `VITE_` é embutida em texto simples no JavaScript final servido ao browser — visível a qualquer pessoa via "Ver código-fonte" ou aba Network. Hoje o componente `MapView` não está a ser importado em lado nenhum da app (código morto do template Manus), por isso o risco atual é zero — mas se for ativado sem cuidado, essa chave fica pública.

**Correção:** se algum dia precisares de mapas, mantém a chamada atrás de um endpoint teu no servidor (nunca no bundle), ou usa restrição por domínio/referrer na própria chave.

---

### 🟡 MÉDIO — Scaffold de OAuth com "state" previsível (código morto)
**Onde:** `client/src/const.ts`

```ts
const redirectUri = `${window.location.origin}/api/oauth/callback`;
const state = btoa(redirectUri); // <- previsível, não é um nonce aleatório
```

O parâmetro `state` num fluxo OAuth existe para prevenir CSRF — tem de ser um valor aleatório e imprevisível, verificado no retorno. Aqui é só o `redirectUri` em base64: qualquer atacante consegue calculá-lo. Esta função (`getLoginUrl`) não é chamada em lado nenhum hoje (resto de template), mas se for ligada a um login real sem corrigir isto, abre um vetor de CSRF no login.

---

### 🟡 MÉDIO — Sem headers de segurança HTTP nem rate limiting no servidor
**Onde:** `server/index.ts`

O Express está "nu": sem `helmet` (CSP, `X-Frame-Options`, `X-Content-Type-Options`, etc.), sem rate limiting em nenhuma rota, sem HTTPS forçado a nível de app. Ainda não há rotas de API para abusar, mas isto tem de estar resolvido **antes** da primeira rota de login/pagamento real, ou fica exposto a força bruta, clickjacking e outros ataques triviais desde o dia 1.

---

### 🟢 BAIXO — Dependência não usada aumenta superfície de ataque
`axios` está no `package.json` (`dependencies`) mas **não é importado em lado nenhum** do código (`grep` confirma). É peso morto no bundle e mais uma dependência para manter atualizada sem benefício nenhum hoje. Recomendo remover.

---

## 3. Auditoria de dependências (`pnpm audit`)

Correu `pnpm audit` contra o `pnpm-lock.yaml`: **137 avisos (2 críticos, 52 altos, 74 médios, 9 baixos)**. Importante triar isto com cuidado para não gerar pânico onde não é preciso:

- **A grande maioria é em ferramentas de build/dev** (`vite`, `pnpm`, `rollup`, `tar`, `postcss`, `browserslist`, `nanoid`, `path-to-regexp`, `picomatch`) — estas correm na tua máquina/CI ao fazer build, **não no site publicado**. Risco real: se alguém comprometer o teu ambiente de build (ex.: instalar um pacote malicioso ou correr `pnpm install` num repo não confiável), pode ganhar execução de código local. Ação: mantém o `pnpm` e o `vite` atualizados antes de cada build de produção; não corras `pnpm install`/scripts de lifecycle em repositórios não confiáveis.
- **`axios` tem 12 avisos, incluindo altos** (poluição de protótipo, ReDoS, fugas de headers) — mas como confirmado acima, não é usado no código. Ainda assim entra no bundle instalado; remove-o.
- **`dompurify` (moderado, XSS)** vem de uma dependência transitiva de UI (provavelmente de um componente de renderização de markdown/streamdown do template) — vale confirmar se algum componente sanitiza HTML de utilizador com isto antes de correr risco real; hoje a app não tem inputs de texto livre renderizados como HTML.

**Ação recomendada:** antes de qualquer lançamento público, correr `pnpm update` nos pacotes de produção (`express`, e o que vier a ser adicionado para backend/pagamentos), remover o `axios`, e manter `pnpm audit` como passo do pipeline de CI.

---

## 4. Plano de correção priorizado

| Prioridade | Item | Ação |
| --- | --- | --- |
| 1 | Sem backend real | Construir API própria (Node/Express, Fastify, ou equivalente) com base de dados, antes de qualquer dado ou pagamento real |
| 2 | Autenticação falsa | Implementar registo/login reais: hash de password (bcrypt/argon2), sessão via cookie `HttpOnly` + `Secure` + `SameSite=Lax/Strict`, validado no servidor a cada pedido |
| 3 | Admin sem controlo de acesso | Adicionar campo de `role` no utilizador (guardado no servidor), e middleware que verifica `role === "admin"` em **cada** rota/ação de admin — nunca só na UI |
| 4 | Tier pago confiado ao cliente | Guardar o tier do cliente no servidor (ligado ao registo de pagamento), e servir/bloquear conteúdo Premium a partir do servidor, não do `sessionStorage` |
| 5 | Headers de segurança | Adicionar `helmet` no Express + rate limiting (ex. `express-rate-limit`) assim que existirem rotas de login/API |
| 6 | Chave de API / OAuth scaffold | Remover código morto (`Map.tsx`, `ManusDialog.tsx`, `getLoginUrl`) ou corrigi-lo antes de ativar (chave no servidor, `state` OAuth aleatório) |
| 7 | Dependências | Remover `axios` não usado; atualizar `pnpm`/`vite` antes de builds de produção; `pnpm audit` no CI |

---

## 5. O que já está bem feito
- O próprio time já documentou honestamente os limites em `TECHNICAL_AUDIT.md` — isso é raro e vale manter como prática (documentar o que é demo vs. produção).
- Os middlewares de debug do Manus (`/__manus__/logs`, proxy de storage) só correm no `vite dev`, e há um plugin (`vitePluginStripInternalAssets`) que remove os assets `__manus__/` do build de produção — isto está corrigido corretamente.
- `express.static` + rota catch-all é o padrão certo para servir uma SPA; não há travessia de diretório visível aqui.

---

**Resumo direto:** nada disto é grave *hoje* porque não há dados reais nem dinheiro a passar pelo sistema — mas se ligares Escalapay/Stripe ou dados de clientes reais a esta base de código **sem primeiro resolver os pontos 1 a 4 da tabela**, qualquer pessoa com F12 aberto consegue: (a) entrar como admin, (b) desbloquear o plano mais caro sem pagar, e (c) ver métricas internas do negócio. É o mesmo padrão que já vimos noutro dos teus projetos (auth/pagamento no `ebook-educacao-financeira`) — vale tratar as duas apps com a mesma régua antes de lançar.

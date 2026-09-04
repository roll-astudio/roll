# Servidor / backend

**Pergunta:** onde e com que tecnologia vamos correr o servidor?

## Decisão

Não há um backend nosso. A divisão é:

| Peça | Tecnologia | Onde corre |
| --- | --- | --- |
| **Aplicação** | Next.js 16 (App Router) + React 19 + TypeScript | Vercel, região `fra1` (Frankfurt) |
| **Backend** | Supabase (Auth, Postgres, Storage, RLS) | Projecto Supabase, região EU |

O repositório é só a app Next.js (`app/`). Não há serviço Express/Nest/Fastify, nem “API Roll” separada.

O Next.js fala com o Supabase (`@supabase/supabase-js` e/ou `@supabase/ssr`) a partir de Server Components, Server Actions e, quando preciso, Route Handlers. A lógica de dados, contas e ficheiros fica no Supabase.

## Opções consideradas

### 1. Next.js + Supabase, sem API própria (escolhida)

A Vercel serve a app. O Supabase é o backend: base de dados, login, storage e políticas RLS.

**Prós:** um só repo de código; Auth/BD/ficheiros no mesmo produto; RLS em vez de uma camada de API; já é o modelo do protótipo Next.js.

**Contras:** operações que precisam de segredo de terceiros (ex. assinar playback Mux, webhooks Stripe/Mux) correm na app Next.js (Route Handler) ou, pontualmente, numa Edge Function do Supabase — não num backend Roll.

### 2. API Node (Express, Fastify, Nest) + Next.js

Dois deploys, CORS, auth duplicada.

**Contras:** é exactamente o backend próprio que não vamos ter. Descartada.

### 3. Next.js como único sítio de dados (ficheiros, SQLite, Route Handlers como CRUD)

**Contras:** reimplementa o que o Supabase já dá (Postgres, Auth, Storage). Descartada.

### 4. Máquina virtual ou Kubernetes

**Contras:** operação a mais. Fora de âmbito.

## Como corre em produção

- **App:** `next build` na Vercel (Production + Preview de PRs).
- **Backend:** projecto Supabase (staging/prod conforme ambientes).
- **Segredos da app:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (só servidor), chaves Mux. A service role **nunca** vai para o browser.
- **Cliente:** chave `anon` + sessão do utilizador; o Postgres só devolve o que o RLS permitir.
- **Tarefas longas:** encoding no Mux; a app só recebe webhooks e actualiza tabelas no Supabase.

## Papel de cada lado

**Next.js**

- UI (catálogo, ficha, conta, admin).
- Sessão Supabase em cookies (`@supabase/ssr` + middleware).
- Orquestração pontual: webhooks Mux/Stripe, emissão de JWT Mux depois de ler entitlement no Supabase.

**Supabase (backend)**

- Utilizadores e sessão (Auth).
- PostgreSQL (catálogo, compras, entitlements).
- Storage (imagens e restantes ficheiros).
- RLS como fronteira de autorização dos dados.

O bitstream do filme continua a ser o Mux, não o Next.js nem um servidor nosso.

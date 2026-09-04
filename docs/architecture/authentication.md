# Autenticação e utilizadores

**Pergunta:** como vamos gerir autenticação e utilizadores?

## Decisão

| | |
| --- | --- |
| **Solução** | Supabase Auth (backend) |
| **Na app** | `@supabase/ssr` no Next.js (cookies, middleware) |
| **Contas** | Email + palavra-passe; OAuth Google como segundo método |
| **Persistência** | `auth.users` no projecto Supabase; `public.profiles` para dados da Roll |
| **Autorização de dados** | RLS no Postgres |
| **Autorização de playback** | Entitlement no Postgres; depois JWT Mux (orquestrado no Next.js) |

Login prova **quem** é a pessoa (Supabase). **O que pode ver** no player é entitlement na base, não o facto de estar autenticado.

Não há Auth.js, Clerk nem um serviço de contas nosso.

## Opções consideradas

### 1. Supabase Auth (escolhida)

**Prós:** o backend já é o Supabase; JWT + RLS; reset de password e OAuth na consola; sessão na mesma app Next.js.

**Contras:** UI de login é nossa (páginas Next.js + `signInWithPassword` / `signInWithOAuth`).

### 2. Auth.js / Clerk + Postgres à parte

**Contras:** segundo sistema de identidade, fora do backend escolhido. Descartada.

### 3. Auth “à mão” no Next.js

**Contras:** reimplementa o Auth do Supabase. Descartada.

## Integração Next.js

- Middleware: refrescar sessão Supabase no cookie.
- Server Components: cliente servidor com cookies; ler `getUser()` antes de mostrar biblioteca ou pedir token Mux.
- Client Components: `signIn` / `signOut` contra o mesmo projecto.
- `SUPABASE_SERVICE_ROLE_KEY` só em Route Handlers de webhook/admin — nunca no bundle do browser.

## Papéis

| Papel | Quem | Acesso |
| --- | --- | --- |
| `viewer` | Público com conta | Catálogo; player só com entitlement |
| `admin` | Equipa Roll / aStudio | Metadados, ingest Mux, listar compras |

Implementação simples: tabela `admins` (`user_id`) ou claim `app_metadata.role = 'admin'` no Auth. As políticas RLS leem isso.

## Requisitos de produto

- Conta necessária para comprar e para a biblioteca (“Na tua biblioteca”).
- Sessão Supabase válida para emitir o JWT Mux.
- Palavras-passe só no Auth do Supabase (hashing deles; nunca plaintext nas nossas tabelas).
- Emails de Auth (confirmação, reset) via SMTP / templates do Supabase no domínio `roll.pt`.
- RGPD: apagar conta no Auth + rows em `public`; no Mux usar `viewer-user-id` = UUID do Auth, não o email.

## O que o protótipo ainda não tem

Os botões de conta no header não ligam ao Supabase. `hasAccess = slug === "fora-de-jogo"` deve passar a `getUser()` + `entitlements`.

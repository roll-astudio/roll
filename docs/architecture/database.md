# Base de dados

**Pergunta:** que base de dados vamos utilizar e onde vai estar alojada?

## Decisão

| | |
| --- | --- |
| **Motor** | PostgreSQL (versão gerida pelo Supabase) |
| **Alojamento** | Supabase (região EU) — o backend da plataforma |
| **Acesso** | Cliente Supabase na app Next.js (`anon` + sessão; `service_role` só no servidor) |
| **Esquema** | SQL no repo (`supabase/migrations`); Studio para inspecção |

Não há Postgres à parte (Neon, RDS, etc.). A base de dados é a do mesmo projecto Supabase que autentica e guarda ficheiros.

## Opções consideradas

### 1. PostgreSQL no Supabase (escolhida)

**Prós:** backend único; Auth (`auth.users`) no mesmo sítio; RLS; Storage; Realtime se um dia for preciso; região EU.

**Contras:** migrations e RLS têm de ser disciplina no repo — o Studio não substitui o Git.

### 2. Neon / RDS + Auth.js

**Prós:** Postgres “nu”.

**Contras:** seria um backend fragmentado (BD num sítio, auth noutro). Incompatível com “o backend é o Supabase”. Descartada.

### 3. MongoDB Atlas

**Contras:** compras e entitlements são relacionais. Descartada.

### 4. SQLite no Next.js / catálogo em memória

**Prós:** o protótipo actual (`films` em `page.tsx`).

**Contras:** não há utilizadores nem compras. Só o mock.

## Modelo mínimo (produção)

Tabelas previstas no schema `public` (nomes indicativos):

| Tabela | Função |
| --- | --- |
| `profiles` | Dados de perfil ligados a `auth.users` |
| `films` | Metadados: slug, título, preço, duração, `mux_asset_id`, `mux_playback_id`, poster |
| `purchases` | Pagamento (provider, valor, estado) |
| `entitlements` | Direito de ver um filme (user × film, tipo buy/rent, validade) |
| `assets` | Referências a objectos no Storage (path, tipo, filme) |

Identidade canónica: `auth.users` (Supabase Auth). Não duplicar passwords em `public`.

O **master do vídeo não fica na base de dados**. O Postgres guarda IDs Mux e paths de posters no Storage.

## RLS (em vez de uma API)

Exemplos de política:

- Catálogo (`films` publicados): `select` público.
- `entitlements` / `purchases`: o utilizador só lê as suas rows (`auth.uid() = user_id`).
- Admin (ingest, preços): role `admin` (claim em JWT ou tabela `admins`) com políticas próprias.
- Escritas de pagamento: `service_role` ou função com `security definer` a partir do webhook, nunca o cliente anónimo.

## Regras

- Projecto Supabase na **EU**.
- Schema e políticas versionados em migrations; sem `ALTER` ad hoc em produção.
- O catálogo hardcoded no frontend passa a `select` na tabela `films`.

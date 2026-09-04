# Arquitectura técnica — Roll

Referência das decisões técnicas da plataforma de streaming de cinema independente (Roll / aStudio).

O objectivo deste conjunto de documentos é:

1. Listar as **principais opções** em cada área.
2. **Fixar a solução escolhida** e o porquê.
3. Servir de base para implementação, onboarding e revisões futuras.

## Contexto do produto

A Roll distribui e comercializa filmes e documentários independentes (TVOD: compra de acesso). O protótipo actual é uma aplicação **Next.js** com catálogo estático e um leitor de demonstração **Mux** em `app/filmes/[slug]/MuxDemoPlayer.tsx`.

Não há um backend próprio (Express, Nest, Fastify, etc.). A aplicação é **só Next.js**. O backend da plataforma é o **Supabase** (PostgreSQL, Auth, Storage, RLS).

## Decisões (resumo)

| Área | Solução escolhida | Alojamento |
| --- | --- | --- |
| Aplicação | Next.js 16 (App Router, TypeScript) — sem API server à parte | Vercel (`fra1`, Frankfurt) |
| Backend | Supabase | Projecto Supabase, região EU |
| Base de dados | PostgreSQL (Supabase) | Mesmo projecto Supabase |
| Streaming de vídeo | Mux Video (HLS + player oficial) | Mux (CDN global) |
| Autenticação | Supabase Auth | Mesmo projecto Supabase |
| Ficheiros | Storage do Supabase; vídeo de playback no Mux | Supabase Storage (EU) + Mux |

Detalhe por área:

- [Backend](./backend.md) — Next.js + Supabase, sem servidor próprio
- [Base de dados](./database.md)
- [Streaming](./streaming.md)
- [Autenticação](./authentication.md)
- [Storage](./storage.md)

## Diagrama lógico

```text
[Browser]
    │
    ▼
[Next.js na Vercel]          UI, Server Components, client do Supabase
    │
    ├── Supabase             backend: Auth, PostgreSQL, Storage, RLS
    └── Mux Video            ingest, transcoding, HLS, signed playback
```

## Princípios

- **Sem backend próprio.** Não existe um segundo serviço Node. Next.js é a app; Supabase é o backend.
- **Uma app, um deploy.** Tudo o que é interface e orquestração (incl. tokens Mux) vive neste repositório Next.js.
- **Vídeo de playback não vive no Next.js nem como ficheiro cru no Storage.** Encoding e CDN de streaming são o Mux.
- **Dados de negócio no Postgres do Supabase.** Catálogo, compras e direitos de visualização, com RLS.
- **Dados na UE.** Vercel Frankfurt e projecto Supabase na EU.
- **TVOD primeiro.** Acesso por compra; playback Mux só com sessão Supabase + entitlement.

## O que fica de fora (por agora)

Pagamentos (Stripe), CRM, analytics de audiência avançado, apps nativas e um CMS editorial dedicado. Quando forem necessários, devem encaixar neste desenho (ex.: Stripe Checkout → webhook no Next.js ou Database Webhook → row de entitlement no Supabase → token Mux).

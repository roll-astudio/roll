# Guia de implementação: upload Mux, guardar IDs, trailer e reprodução

Este documento é o **passo a passo operacional** para um programador. Não substitui as decisões em [`docs/architecture/`](../architecture/README.md); traduz essas decisões em contas, variáveis, tabelas, rotas e código.

**O que tens de conseguir no fim:**

1. Um admin escolhe um ficheiro de filme (e outro de trailer) no browser.
2. O ficheiro **não passa pela Vercel** nem fica como HLS no Supabase. Vai **directo para o Mux**.
3. O Mux recodifica o vídeo (várias qualidades, HLS).
4. Um webhook do Mux actualiza a tabela `films` no Supabase com `mux_asset_id` e `mux_playback_id` (e o equivalente do trailer).
5. Um visitante vê o **trailer** no player.
6. Só quem tem **entitlement** (comprou) recebe um JWT Mux e vê o **filme**.

**O que o protótipo já tem:** `MuxDemoPlayer` / `FilmWatchExperience` com um `playback-id` **público de demo**. Isso **não** é produção. Em produção o playback ID é `signed` e o player precisa de um token.

---

## 0. Modelo mental (lê isto antes de copiar código)

Três sítios, três papéis:

| Sítio | O que guarda | O que **não** guarda |
| --- | --- | --- |
| **Browser** | O ficheiro só enquanto faz upload | Segredos Mux, service role do Supabase |
| **Next.js (Vercel)** | UI, Route Handlers que **orquestram** (criar upload, assinar JWT, receber webhooks) | O binário do filme; HLS |
| **Supabase** | Linha do filme (slug, título, IDs Mux, path do poster); ficheiros de **arquivo/imagens** no Storage | As renditions HLS |
| **Mux** | Asset (vídeo transcodificado) + Playback ID + CDN HLS | Metadados de negócio (preço, slug, quem comprou) |

**IDs que vais ver no Mux:**

- **Upload ID** — existe só durante o envio. Serve para o Mux saber “este PUT é aquele Direct Upload”.
- **Asset ID** (`mux_asset_id`) — o vídeo já ingerido no Mux. É o objecto que podes apagar, listar, inspeccionar.
- **Playback ID** (`mux_playback_id`) — o identificador que o **player** usa. Um asset pode ter vários playback IDs (por exemplo um `public` e um `signed`). Na Roll usamos **`signed`**.

**Filme vs trailer:** são **dois assets Mux diferentes**. O trailer é um MP4/MOV mais curto. O filme é o master completo. No Postgres são colunas diferentes na mesma row `films`. Não tentes “cortar” o filme no player para servir de trailer: isso exigiria o filme completo no cliente.

**Direct Upload (o caminho escolhido):**

```text
1. Browser (admin autenticado) pede ao Next.js: “cria um Direct Upload para o filme X, tipo trailer|feature”
2. Next.js (servidor), com MUX_TOKEN_ID + MUX_TOKEN_SECRET, chama Mux:
   POST /video/v1/uploads
   Mux devolve { id, url }   ← url é um PUT temporário, autenticado
3. Browser faz PUT do ficheiro para essa url (via UpChunk, em bocados).
   O Next.js NUNCA recebe o binário.
4. Mux cria o Asset e começa a transcodificar (minutos).
5. Mux POST no nosso webhook: video.asset.ready
6. Next.js valida a assinatura, lê passthrough (film_id + kind),
   grava asset id + playback id no Supabase (service_role).
7. A ficha /filmes/{slug} lê esses IDs.
8. Para reproduzir: Next.js gera JWT Mux (curto) e o mux-player usa playbackId + tokens.
```

**Arquivo opcional (Storage):** o master “ouro” pode ir também para o bucket privado `archive/{slug}/master.mov`. Isso **não** é o que o player usa. É backup. O player usa só Mux.

---

## 1. Contas e consola Mux (fazer uma vez)

### 1.1 Conta Mux

1. Cria conta em [https://dashboard.mux.com](https://dashboard.mux.com).
2. Usa o ambiente **Development** para testes (assets de teste não entram na facturação de produção da mesma forma; marca `test: true` nos uploads de desenvolvimento).
3. Em produção, usa o ambiente **Production** e tokens diferentes.

### 1.2 Access token (API)

1. Dashboard → Settings → **Access Tokens**.
2. Cria um token com permissão **Mux Video** (ler e escrever).
3. Copia **Token ID** e **Token Secret**. O secret **só aparece uma vez**.
4. Estas duas variáveis servem para: criar Direct Uploads, listar assets, **não** para o player no browser.

Guarda no `.env.local` (nunca no Git, nunca com prefixo `NEXT_PUBLIC_`):

```bash
MUX_TOKEN_ID=xxxxxxxxxxxxxxxxxxxxxxxx
MUX_TOKEN_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 1.3 Signing key (JWT de playback)

Isto é **outro** par de chaves. Sem isto, um Playback ID `signed` **não toca**. O player fica preto / 403.

1. Dashboard → Settings → **Signing Keys** → Create.
2. Copia:
   - **Key ID** → `MUX_SIGNING_KEY_ID`
   - **Private key** (Base64) → `MUX_SIGNING_PRIVATE_KEY`  
     O Mux só te mostra a chave privada **na criação**. Se a perderes, cria outra.

```bash
MUX_SIGNING_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxx
MUX_SIGNING_PRIVATE_KEY=LS0tLS1CRUdJTi...   # uma linha Base64 longa
```

O SDK Node do Mux lê estes nomes por omissão em `mux.jwt.signPlaybackId(...)`.

### 1.4 Webhook

O Mux tem de avisar a app quando o vídeo está pronto. Em local usas um túnel (ngrok, Cloudflare Tunnel, `cloudflared`) porque o Mux não consegue POST para `localhost`.

1. Expõe o teu `next dev`, por exemplo: `https://abc123.ngrok.io`.
2. Dashboard → Settings → **Webhooks** → Create.
3. URL: `https://abc123.ngrok.io/api/webhooks/mux` (em produção: `https://<dominio>/api/webhooks/mux`).
4. Eventos mínimos:
   - `video.upload.asset_created`
   - `video.asset.ready`
   - `video.asset.errored` (para não ficares à espera para sempre)
5. Copia o **Signing secret** do webhook (é **diferente** do Token Secret):

```bash
MUX_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Em cada deploy (Preview vs Production) a URL muda. Actualiza o webhook ou cria um por ambiente.

### 1.5 CORS do Direct Upload

Quando crias o upload, tens de dizer **de que origem o browser** vai fazer o PUT. Se estiver errado, o browser bloqueia no DevTools (erro CORS), não o Mux.

- Local: `http://localhost:3000`
- Produção: `https://roll.pt` (ou o domínio real; **sem** barra no fim, ou exactamente o origin do browser)

Usa uma variável:

```bash
MUX_CORS_ORIGIN=http://localhost:3000
```

---

## 2. Variáveis de ambiente completas

Ficheiro `.env.local` (exemplo). Tudo **sem** `NEXT_PUBLIC_` excepto o que o browser precisa do Supabase.

```bash
# Supabase (browser + servidor)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Só servidor — NUNCA no cliente
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mux API
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_SIGNING_KEY_ID=
MUX_SIGNING_PRIVATE_KEY=
MUX_WEBHOOK_SECRET=
MUX_CORS_ORIGIN=http://localhost:3000
```

Na Vercel: Project → Settings → Environment Variables. Replica Production / Preview / Development.

**Regra:** se uma chave Mux aparece no Network tab do Chrome no pedido de uma página, está mal. Só o **playback ID** (público na HTML) e o **JWT de curta duração** (resposta da tua API de token) podem ir para o cliente.

---

## 3. Pacotes npm

No repositório da app Next.js:

```bash
npm install @mux/mux-node @mux/mux-player-react @mux/upchunk @supabase/supabase-js @supabase/ssr
```

| Pacote | Onde corre | Para quê |
| --- | --- | --- |
| `@mux/mux-node` | **Só servidor** (Route Handlers) | Criar uploads, verificar webhooks, assinar JWT |
| `@mux/upchunk` | **Browser** (admin) | PUT do ficheiro em chunks para a URL do Mux |
| `@mux/mux-player-react` | Browser (ficha do filme) | Player HLS |
| `@supabase/ssr` + `supabase-js` | Servidor e cliente | Sessão, `films`, entitlements |

O protótipo hoje carrega o player por `<Script src="cdn.jsdelivr.net/...">`. Em produção instala o pacote React: tipos, tokens, e sem depender do CDN.

---

## 4. Base de dados: o que guardar (Supabase)

O **ficheiro de vídeo não entra no Postgres**. Entram IDs e paths.

Colunas na tabela `films` (além de slug, título, etc.):

| Coluna | Tipo | Significado |
| --- | --- | --- |
| `id` | `uuid` | PK. Vai no `passthrough` do Mux para o webhook saber que filme actualizar |
| `slug` | `text` | URL `/filmes/{slug}` |
| `poster_path` | `text` | Path no Storage, ex. `posters/fora-de-jogo/cover.jpg` — **não** é o vídeo |
| `mux_asset_id` | `text` nullable | Asset do **filme** |
| `mux_playback_id` | `text` nullable | Playback ID **signed** do filme |
| `mux_ready_at` | `timestamptz` nullable | Quando `video.asset.ready` chegou |
| `mux_trailer_asset_id` | `text` nullable | Asset do **trailer** |
| `mux_trailer_playback_id` | `text` nullable | Playback ID **signed** do trailer |
| `mux_trailer_ready_at` | `timestamptz` nullable | Trailer pronto |
| `ingest_status` | `text` | `idle` / `uploading` / `processing` / `ready` / `errored` |
| `trailer_ingest_status` | `text` | Idem para o trailer |

Migration ilustrativa (ajusta nomes se o schema já existir):

```sql
alter table public.films
  add column if not exists mux_asset_id text,
  add column if not exists mux_playback_id text,
  add column if not exists mux_ready_at timestamptz,
  add column if not exists mux_trailer_asset_id text,
  add column if not exists mux_trailer_playback_id text,
  add column if not exists mux_trailer_ready_at timestamptz,
  add column if not exists ingest_status text not null default 'idle',
  add column if not exists trailer_ingest_status text not null default 'idle';
```

**Entitlements** (quem pode ver o filme, não o trailer):

```sql
-- conceito: uma row = este user pode ver este film
-- user_id uuid references auth.users
-- film_id uuid references films
-- valid_until timestamptz null  -- null = permanente (compra)
```

**RLS (ideia, não copies cego):**

- `films`: `select` público de linhas publicadas (catálogo). Os playback IDs `signed` **sozinhos não servem** para ver o filme — falta o JWT. Mesmo assim não exposas `mux_asset_id` no cliente se não precisares; o player só precisa do playback ID.
- `entitlements`: o user só lê `auth.uid() = user_id`.
- Updates dos campos Mux: **só service_role** (webhook) ou role admin. O browser anónimo **nunca** faz `update films set mux_playback_id`.

---

## 5. Cliente Mux no servidor

Cria **um** módulo que só é importado em Route Handlers / Server Actions. Se o importares num `"use client"`, as chaves podem ir para o bundle.

`lib/mux.ts`:

```ts
import Mux from "@mux/mux-node";

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  throw new Error("Faltam MUX_TOKEN_ID / MUX_TOKEN_SECRET");
}

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
  webhookSecret: process.env.MUX_WEBHOOK_SECRET,
});
```

`lib/supabase/admin.ts` (webhook e updates de ingest — **service role**):

```ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltam variáveis Supabase admin");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

O cliente **com sessão do user** (cookies) fica noutro ficheiro (`createServerClient` do `@supabase/ssr`). Esse é o que usas para “este user comprou?”. O admin client **ignora RLS** — só webhooks e tarefas de sistema.

---

## 6. Passo A — Admin: criar o Direct Upload (servidor)

### 6.1 O que a rota faz

URL: `POST /api/admin/mux/direct-upload`

1. Confirma sessão Supabase.
2. Confirma que o user é **admin**.
3. Lê `filmId` e `kind` (`feature` | `trailer`).
4. Confirma que o filme existe.
5. Pede ao Mux um Direct Upload com:
   - `playback_policy: ['signed']`
   - `max_resolution_tier: '1080p'` (alinhado à arquitectura; 4K só se justificares custo)
   - `passthrough`: string JSON `{"filmId":"...","kind":"feature"}` — o webhook **não sabe** o nosso slug; só o que pusermos aqui.
6. Marca `ingest_status` / `trailer_ingest_status` = `uploading`.
7. Devolve ao browser `{ uploadId, uploadUrl }`. **Não** devolve Token Secret.

### 6.2 Código da rota

`app/api/admin/mux/direct-upload/route.ts`:

```ts
import { NextResponse } from "next/server";
import { mux } from "@/lib/mux";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server"; // o teu wrapper @supabase/ssr

type Kind = "feature" | "trailer";

function isKind(value: unknown): value is Kind {
  return value === "feature" || value === "trailer";
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Exemplo: tabela public.admins (user_id). Adapta ao vosso modelo.
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    return NextResponse.json({ error: "Não és admin" }, { status: 403 });
  }

  const body = (await request.json()) as { filmId?: string; kind?: string };
  if (!body.filmId || !isKind(body.kind)) {
    return NextResponse.json(
      { error: "Body inválido: { filmId, kind: 'feature' | 'trailer' }" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: film, error: filmError } = await admin
    .from("films")
    .select("id, slug")
    .eq("id", body.filmId)
    .single();

  if (filmError || !film) {
    return NextResponse.json({ error: "Filme não encontrado" }, { status: 404 });
  }

  const corsOrigin = process.env.MUX_CORS_ORIGIN;
  if (!corsOrigin) {
    return NextResponse.json({ error: "MUX_CORS_ORIGIN em falta" }, { status: 500 });
  }

  const upload = await mux.video.uploads.create({
    cors_origin: corsOrigin,
    new_asset_settings: {
      playback_policies: ["signed"],
      max_resolution_tier: "1080p",
      video_quality: "plus",
      passthrough: JSON.stringify({ filmId: film.id, kind: body.kind }),
      meta: {
        title: `${film.slug} (${body.kind})`,
      },
      // em development podes activar:
      // test: true,
    },
  });

  const statusColumn =
    body.kind === "feature" ? "ingest_status" : "trailer_ingest_status";

  await admin
    .from("films")
    .update({ [statusColumn]: "uploading" })
    .eq("id", film.id);

  return NextResponse.json({
    uploadId: upload.id,
    uploadUrl: upload.url,
  });
}
```

Notas:

- `upload.url` é um URL **temporário** (horas). Se o admin deixar o tab aberto um dia, pede **outro** Direct Upload.
- `passthrough` tem limite de tamanho (poucos KB). Só IDs, não o nome do ficheiro de 4 GB.
- `playback_policies: ['signed']` é o que obriga o JWT no passo de reprodução. Se puseres `'public'`, qualquer pessoa com o playback ID vê o filme sem comprar — **proibido** para o feature.

---

## 7. Passo B — Admin: enviar o ficheiro (browser)

O browser **não** chama `api.mux.com` com o Token Secret. Só faz PUT para `uploadUrl`.

Usa **UpChunk**: ficheiros grandes partem-se em chunks; se a rede cair, retoma melhor do que um `fetch` único.

`components/admin/MuxDirectUpload.tsx` (exemplo mínimo):

```tsx
"use client";

import * as UpChunk from "@mux/upchunk";
import { useState } from "react";

type Kind = "feature" | "trailer";

export function MuxDirectUpload({
  filmId,
  kind,
}: {
  filmId: string;
  kind: Kind;
}) {
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState<string>("Escolhe um ficheiro de vídeo");

  async function onFile(file: File | undefined) {
    if (!file) return;

    setMessage("A pedir URL de upload ao servidor…");
    const res = await fetch("/api/admin/mux/direct-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filmId, kind }),
    });

    if (!res.ok) {
      setMessage(`Erro a criar upload: ${await res.text()}`);
      return;
    }

    const { uploadUrl } = (await res.json()) as { uploadUrl: string };

    setMessage("A enviar para o Mux (não fecha o tab)…");

    const upload = UpChunk.createUpload({
      endpoint: uploadUrl,
      file,
      chunkSize: 5120, // KB (~5 MiB). Não aumentes sem ler a doc do Mux.
    });

    upload.on("progress", (event) => {
      setPercent(Math.round(Number(event.detail)));
    });

    upload.on("error", (event) => {
      setMessage(`Falha no upload: ${String(event.detail)}`);
    });

    upload.on("success", () => {
      setPercent(100);
      setMessage(
        "Ficheiro no Mux. Agora espera pelo webhook video.asset.ready (minutos). O player só funciona depois disso.",
      );
    });
  }

  return (
    <div>
      <p>
        {kind === "feature" ? "Filme completo" : "Trailer"} — {percent}%
      </p>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <p>{message}</p>
    </div>
  );
}
```

**Checklist deste passo:**

- [ ] Estás autenticado como admin (cookies da sessão no `fetch`; não precisas de meter o JWT à mão se usas same-origin).
- [ ] O ficheiro é vídeo (ProRes/H.264 conforme o que a aStudio entregar). Áudio-only não é o caso de uso.
- [ ] Não faças upload de um MP4 de 20 GB **através** de um Route Handler Next.js (`FormData` para o servidor). A Vercel tem limite de body; além disso viola a arquitectura.
- [ ] Depois de 100%, **o filme ainda não está visível**. Falta transcode + webhook.

### 7.1 (Opcional) Arquivo no Supabase Storage

Em paralelo, ou noutro botão “Arquivar master”:

1. Admin autenticado pede um **signed upload** ao Storage (ou usa o cliente Supabase com políticas admin).
2. Path: `archive/{slug}/master.mov` no bucket privado `archive`.
3. Isto **não** cria playback. Se só fizeres isto, o player continua vazio.

Não uses o MP4 do Storage como `src` do `<video>` para o filme comercial.

---

## 8. Passo C — Webhook: Mux diz que está pronto (servidor)

### 8.1 Por que o webhook é obrigatório

O transcode **não é síncrono**. O `success` do UpChunk só significa “os bytes chegaram”. As rendições HLS aparecem minutos depois. O Mux chama-te.

### 8.2 Corpo cru, não `request.json()`

A verificação da assinatura precisa do **texto exacto** do body. Se fizeres `await request.json()`, perdes o raw e a verificação falha.

### 8.3 Código

`app/api/webhooks/mux/route.ts`:

```ts
import { NextResponse } from "next/server";
import { mux } from "@/lib/mux";
import { createAdminClient } from "@/lib/supabase/admin";

type Passthrough = { filmId: string; kind: "feature" | "trailer" };

function parsePassthrough(raw: string | undefined): Passthrough | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Passthrough;
    if (!parsed.filmId) return null;
    if (parsed.kind !== "feature" && parsed.kind !== "trailer") return null;
    return parsed;
  } catch {
    return null;
  }
}

function signedPlaybackId(
  playbackIds: Array<{ id: string; policy: string }> | undefined,
): string | undefined {
  return playbackIds?.find((p) => p.policy === "signed")?.id;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  let event;
  try {
    event = mux.webhooks.unwrap(rawBody, request.headers);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "video.upload.asset_created") {
    // O upload já tem asset_id, mas o vídeo ainda pode estar a processar.
    // Podes só logar. O estado "ready" é video.asset.ready.
    return NextResponse.json({ ok: true });
  }

  if (event.type === "video.asset.errored") {
    const pt = parsePassthrough(event.data.passthrough);
    if (pt) {
      const column =
        pt.kind === "feature" ? "ingest_status" : "trailer_ingest_status";
      await admin
        .from("films")
        .update({ [column]: "errored" })
        .eq("id", pt.filmId);
    }
    return NextResponse.json({ ok: true });
  }

  if (event.type === "video.asset.ready") {
    const asset = event.data;
    const pt = parsePassthrough(asset.passthrough);
    if (!pt) {
      console.error("video.asset.ready sem passthrough válido", asset.id);
      return NextResponse.json({ ok: true });
    }

    const playbackId = signedPlaybackId(asset.playback_ids);
    if (!playbackId) {
      console.error("Asset ready sem playback signed", asset.id);
      return NextResponse.json({ ok: true });
    }

    if (pt.kind === "feature") {
      await admin
        .from("films")
        .update({
          mux_asset_id: asset.id,
          mux_playback_id: playbackId,
          mux_ready_at: new Date().toISOString(),
          ingest_status: "ready",
        })
        .eq("id", pt.filmId);
    } else {
      await admin
        .from("films")
        .update({
          mux_trailer_asset_id: asset.id,
          mux_trailer_playback_id: playbackId,
          mux_trailer_ready_at: new Date().toISOString(),
          trailer_ingest_status: "ready",
        })
        .eq("id", pt.filmId);
    }
  }

  return NextResponse.json({ ok: true });
}
```

**Como testar o webhook:**

1. `next dev` + túnel HTTPS.
2. Faz um upload pequeno (um trailer de 30 s).
3. Dashboard Mux → Webhooks → vê entregas (200 vs 4xx).
4. Supabase Table Editor → `films` → `mux_trailer_playback_id` preenchido e `trailer_ingest_status = ready`.

Se o webhook devolver 401/400, o Mux **repete**. Corrige a assinatura; não ignores falhas.

Enquanto `ingest_status !== 'ready'`, a UI admin deve dizer “A processar…” e a ficha pública **não** deve montar o player do filme.

---

## 9. Passo D — Ir buscar o filme (ler o que vamos reproduzir)

Na página `app/filmes/[slug]/page.tsx` (Server Component):

1. Lê o filme por `slug` (cliente Supabase com cookie / anon + RLS).
2. Lê o user (`getUser()`).
3. Se houver user, lê `entitlements` para aquele `film_id`.
4. **Não** assines o JWT aqui se fores cachear a página HTML com o token dentro — o token expiraria na cache. Padrão seguro: a página sabe `hasEntitlement` e o playback ID; o **token** vem de um Route Handler no momento de “Ver filme” / “Ver trailer”.

Exemplo de leitura (servidor):

```ts
export async function getFilmForWatchPage(slug: string, userId: string | null) {
  const supabase = await createServerSupabase();

  const { data: film, error } = await supabase
    .from("films")
    .select(
      `
      id,
      slug,
      title,
      poster_path,
      mux_playback_id,
      mux_trailer_playback_id,
      ingest_status,
      trailer_ingest_status
    `,
    )
    .eq("slug", slug)
    .single();

  if (error || !film) return null;

  let hasEntitlement = false;
  if (userId) {
    const { data: ent } = await supabase
      .from("entitlements")
      .select("id")
      .eq("user_id", userId)
      .eq("film_id", film.id)
      .or("valid_until.is.null,valid_until.gt.now()")
      .maybeSingle();
    hasEntitlement = Boolean(ent);
  }

  return { film, hasEntitlement };
}
```

Poster: constrói o URL público do Storage (`public-media`) a partir de `poster_path`. O player Mux também consegue thumbnail via `image.mux.com`, mas **com playback signed precisas de um JWT de tipo `thumbnail`** — por isso o poster no Storage é mais simples para a hero.

---

## 10. Passo E — Pedir o JWT e reproduzir

### 10.1 Porque há dois tokens (pelo menos)

Com Playback ID **signed**, o Mux bloqueia:

- o manifesto HLS (`.m3u8`) → JWT tipo **playback**
- o thumbnail → JWT tipo **thumbnail**
- o storyboard (preview na barra) → JWT tipo **storyboard**

Se só enviares o de playback, o vídeo pode arrancar e a UI do player ficar partida (poster/timeline). Gera os três com a mesma validade.

TTL: **15–60 minutos** (arquitectura). Quando expirar, o user pede outro token (novo `fetch`); não alongues para 7 dias.

### 10.2 Função de assinatura

`lib/mux-sign-playback.ts`:

```ts
import { mux } from "@/lib/mux";

const TTL = "45m";

export async function signMuxPlayback(playbackId: string) {
  const playback = await mux.jwt.signPlaybackId(playbackId, {
    expiration: TTL,
    type: "playback",
  });
  const thumbnail = await mux.jwt.signPlaybackId(playbackId, {
    expiration: TTL,
    type: "thumbnail",
  });
  const storyboard = await mux.jwt.signPlaybackId(playbackId, {
    expiration: TTL,
    type: "storyboard",
  });

  return { playback, thumbnail, storyboard };
}
```

### 10.3 Rota: trailer (sem compra)

Qualquer visitante da ficha (ou só autenticados — decisão de produto; a arquitectura não exige compra para o trailer). Recomendação: trailer **sem entitlement**, mas **ainda signed**, para não ficares com um HLS hotlinkável para sempre.

`app/api/mux/trailer-token/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { signMuxPlayback } from "@/lib/mux-sign-playback";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug obrigatório" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: film } = await supabase
    .from("films")
    .select("mux_trailer_playback_id, trailer_ingest_status, title")
    .eq("slug", slug)
    .single();

  if (!film?.mux_trailer_playback_id || film.trailer_ingest_status !== "ready") {
    return NextResponse.json({ error: "Trailer indisponível" }, { status: 404 });
  }

  const tokens = await signMuxPlayback(film.mux_trailer_playback_id);

  return NextResponse.json({
    playbackId: film.mux_trailer_playback_id,
    tokens,
    title: film.title,
  });
}
```

### 10.4 Rota: filme (com sessão + entitlement)

`app/api/mux/playback-token/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { signMuxPlayback } from "@/lib/mux-sign-playback";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug obrigatório" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Inicia sessão" }, { status: 401 });
  }

  const { data: film } = await supabase
    .from("films")
    .select("id, title, mux_playback_id, ingest_status")
    .eq("slug", slug)
    .single();

  if (!film?.mux_playback_id || film.ingest_status !== "ready") {
    return NextResponse.json({ error: "Filme ainda não está pronto" }, { status: 404 });
  }

  const { data: ent } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", user.id)
    .eq("film_id", film.id)
    .or("valid_until.is.null,valid_until.gt.now()")
    .maybeSingle();

  if (!ent) {
    return NextResponse.json({ error: "Sem acesso. Compra o filme." }, { status: 403 });
  }

  const tokens = await signMuxPlayback(film.mux_playback_id);

  return NextResponse.json({
    playbackId: film.mux_playback_id,
    tokens,
    title: film.title,
    viewerUserId: user.id, // UUID Auth — nunca o email (RGPD / docs de auth)
  });
}
```

Sem entitlement: **não** devolvas token. A UI mostra “Comprar acesso”. Sem token, o Mux **não entrega segmentos**.

### 10.5 Player (substituir o demo hardcoded)

Hoje o código usa `"playback-id": "EcHgOK9coz5K4rjSwOkoE7Y7O01201YMIC200RI6lNxnhs"`. Isso é um asset **público de demo**. Troca por `@mux/mux-player-react` + tokens.

`components/RollMuxPlayer.tsx`:

```tsx
"use client";

import MuxPlayer from "@mux/mux-player-react";

type Tokens = {
  playback: string;
  thumbnail: string;
  storyboard: string;
};

export function RollMuxPlayer({
  playbackId,
  tokens,
  title,
  viewerUserId,
}: {
  playbackId: string;
  tokens: Tokens;
  title: string;
  viewerUserId: string;
}) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      tokens={{
        playback: tokens.playback,
        thumbnail: tokens.thumbnail,
        storyboard: tokens.storyboard,
      }}
      metadata={{
        video_title: title,
        viewer_user_id: viewerUserId,
      }}
      playsInline
      preload="metadata"
      style={{ width: "100%", aspectRatio: "16 / 9" }}
    />
  );
}
```

Na experiência da ficha (esqueleto):

```tsx
"use client";

import { useState } from "react";
import { RollMuxPlayer } from "@/components/RollMuxPlayer";

type Mode = "idle" | "trailer" | "feature";

export function FilmPlayers({ slug, hasEntitlement }: { slug: string; hasEntitlement: boolean }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [payload, setPayload] = useState<{
    playbackId: string;
    tokens: { playback: string; thumbnail: string; storyboard: string };
    title: string;
    viewerUserId?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(path: "/api/mux/trailer-token" | "/api/mux/playback-token") {
    setError(null);
    const res = await fetch(`${path}?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) {
      setError(await res.text());
      setPayload(null);
      return;
    }
    setPayload(await res.json());
    setMode(path.includes("trailer") ? "trailer" : "feature");
  }

  return (
    <div>
      <button type="button" onClick={() => void load("/api/mux/trailer-token")}>
        Ver trailer
      </button>
      {hasEntitlement ? (
        <button type="button" onClick={() => void load("/api/mux/playback-token")}>
          Ver filme
        </button>
      ) : (
        <p>Compra o acesso para ver o filme.</p>
      )}
      {error ? <p>{error}</p> : null}
      {payload && mode !== "idle" ? (
        <RollMuxPlayer
          playbackId={payload.playbackId}
          tokens={payload.tokens}
          title={payload.title}
          viewerUserId={payload.viewerUserId ?? "anonymous-trailer"}
        />
      ) : null}
    </div>
  );
}
```

Fluxo de visualização (o mesmo da arquitectura, agora com nomes de rotas):

```text
User abre /filmes/{slug}
  → Next.js lê films + (se login) entitlements
  → Clica "Ver trailer"
      → GET /api/mux/trailer-token?slug=
      → mux-player + tokens → Mux CDN HLS
  → Clica "Ver filme"
      → GET /api/mux/playback-token?slug=
      → 401 se não há sessão
      → 403 se não há entitlement
      → 200 + JWT → mux-player
```

---

## 11. Ordem de trabalho recomendada (para não te perderes)

Faz **nesta ordem**. Não começes pelo player de produção.

1. Conta Mux + `.env.local` (tokens API).
2. Página admin temporária: Direct Upload de um vídeo de **30 segundos**, `playback_policies: ['public']` **só neste teste**, player com o playback ID que vês no dashboard. Confirma que UpChunk + Mux funcionam.
3. Webhook + túnel + `passthrough` a escrever numa row de teste no Supabase.
4. Muda o teste para `signed`. Cria Signing Key. Confirma que **sem** JWT o player falha e **com** JWT funciona.
5. Separa trailer vs feature (dois uploads, duas colunas).
6. Liga entitlement à rota do filme.
7. Remove o playback ID de demo `EcHgOK9coz5K4rj...` de `MuxDemoPlayer` / `FilmWatchExperience`.
8. Posters no Storage; player só para trailer/filme.

---

## 12. Erros típicos (lê quando algo “não toca”)

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| CORS no PUT do upload | `cors_origin` ≠ origin do browser (`http` vs `https`, porta, www) | Igualar `MUX_CORS_ORIGIN` ao que vês na barra de endereço |
| Upload 100% mas player vazio | A esperar `asset.ready`; ou webhook a falhar | Dashboard Mux → asset status; logs da rota webhook |
| Webhook 400 | `request.json()` em vez de `request.text()`; secret errado | Raw body + `MUX_WEBHOOK_SECRET` do **webhook**, não do access token |
| Player 403 / preto com signed | Sem JWT, JWT expirado, Signing Key errada, ou playback ID `public` misturado | Confirma policy `signed` no asset; `MUX_SIGNING_KEY_ID` + private key |
| Trailer ok, filme 403 | Sem row em `entitlements` | Cria entitlement de teste para o teu `auth.users.id` |
| Filme visível sem comprar | `playback_policies: ['public']` no feature | Recria playback ID signed; não uses o demo público |
| Token no HTML em cache | JWT gerado no Server Component estático | Token só via Route Handler no clique |
| Chaves Mux no cliente | Import de `lib/mux.ts` num Client Component | Mux Node **só** em Route Handlers |
| Body too large na Vercel | Upload via FormData para Next.js | Direct Upload + UpChunk |
| Thumbnail Mux partido | Falta token `thumbnail` | `signPlaybackId` com `type: 'thumbnail'` |

---

## 13. O que **não** fazes (âmbitos)

- Não serves HLS a partir do Supabase Storage.
- Não guardas o master na Vercel (`public/`).
- Não implementas neste guia Stripe, DRM Hollywood, watermarking forense, nem live.
- Não uses `viewer_user_id` = email.
- Não faças download do ficheiro completo no player (produto: streaming on-demand).

---

## 14. Mapa de ficheiros (quando fores implementar)

```text
.env.local
lib/mux.ts
lib/mux-sign-playback.ts
lib/supabase/admin.ts
lib/supabase/server.ts
app/api/admin/mux/direct-upload/route.ts
app/api/webhooks/mux/route.ts
app/api/mux/trailer-token/route.ts
app/api/mux/playback-token/route.ts
components/admin/MuxDirectUpload.tsx
components/RollMuxPlayer.tsx
app/filmes/[slug]/page.tsx          ← lê films + entitlement; já não hardcoded
```

---

## 15. Critério de sucesso (checklist)

- [ ] Admin faz upload do trailer → após webhook, `mux_trailer_playback_id` preenchido.
- [ ] Admin faz upload do filme → `mux_playback_id` preenchido, `ingest_status = ready`.
- [ ] Visitante em `/filmes/{slug}` reproduz o **trailer**.
- [ ] Visitante **sem** compra **não** reproduz o filme (403, UI de compra).
- [ ] Visitante **com** sessão + entitlement reproduz o filme no `mux-player` (`streamType="on-demand"`).
- [ ] DevTools: nenhum `MUX_TOKEN_SECRET` / service role no JavaScript do cliente.
- [ ] O playback ID de demo do protótipo já não está no código de produção.

Referências de decisão: [streaming](../architecture/streaming.md), [storage](../architecture/storage.md), [database](../architecture/database.md), [backend](../architecture/backend.md), [authentication](../architecture/authentication.md). Documentação Mux: Direct Uploads, signed playback IDs, `@mux/mux-player-react` tokens, webhooks `video.asset.ready`.

# Storage

**Pergunta:** onde vamos guardar filmes, imagens e restantes ficheiros?

## Decisão

O storage da plataforma é o **Supabase Storage** (mesmo projecto que Auth e Postgres). O Next.js não guarda ficheiros. O vídeo **para ver** continua no Mux.

| Tipo de ficheiro | Onde | Visibilidade |
| --- | --- | --- |
| Master e mezzanine de arquivo | Disco da aStudio + bucket privado `archive` no Storage | Privado (RLS / signed URL) |
| Versão de streaming (HLS, renditions) | **Mux** | Só via playback assinado |
| Posters, stills, hero, logos de filme | Bucket `public-media` (ou equivalente) | Público (CDN do Storage) |
| Logos da marca (Roll) | `public/logos/` no repo *ou* Storage se forem geridos no admin | Público |
| Documentos (contratos, press kits) | Bucket privado `docs` | Privado / signed URL |
| Ingest de filme para playback | Mux Direct Upload (não passa pelo Next.js nem pelo Storage como HLS) | N/A |

**Regra:** a Vercel não armazena vídeos. O backend de ficheiros é o Supabase; o backend de streaming é o Mux.

## Opções consideradas

### 1. Supabase Storage + Mux (escolhida)

**Prós:** um backend (Supabase) para imagens, docs e arquivo; políticas alinhadas com Auth; Mux só para o que é ABR/CDN de filme.

**Contras:** masters muito grandes (dezenas de GB) têm limites práticos de upload — o arquivo “ouro” pode ficar na aStudio e só uma cópia mezzanine no bucket.

### 2. Cloudflare R2 / S3 / Vercel Blob

**Contras:** segundo sítio de objectos, além do Supabase. Desnecessário enquanto o Storage chegar.

### 3. Servir vídeo a partir do Storage (MP4 no bucket)

**Contras:** sem ABR de qualidade, hotlink difícil de controlar, bandwidth no Supabase. Playback é Mux, não um MP4 no Storage.

### 4. Só `public/` no Git

**Contras:** ok para SVG/PNG da UI; não para catálogo nem masters.

## Convenção de paths

```text
public-media/posters/{film-slug}/cover.jpg
public-media/stills/{film-slug}/01.jpg
archive/{film-slug}/master.mov
docs/{film-slug}/press-kit.pdf
```

Na tabela `films`, `poster_path` aponta para o Storage; `mux_asset_id` aponta para o streaming.

## Upload

- **Imagens / docs:** admin autenticado → cliente Supabase (ou signed upload) → bucket. O Next.js não faz proxy do binário.
- **Filme para ver:** Direct Upload Mux. Opcional: guardar o master no bucket `archive`.
- **RLS:** buckets privados só com `auth.uid()` (próprios) ou role admin; bucket público só para posters publicados.

## Relação com streaming

Storage (este documento) = **ficheiros no backend Supabase**.  
Streaming (`streaming.md`) = **HLS no Mux**.

Um filme: arquivo no Storage (e na aStudio) + playback no Mux.

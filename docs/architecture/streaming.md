# Streaming

**Pergunta:** onde vamos armazenar os filmes e que tecnologia/serviço vamos utilizar para fazer o streaming?

## Decisão

| | |
| --- | --- |
| **Serviço** | Mux Video |
| **Formato de entrega** | HLS (on-demand), player `@mux/mux-player` |
| **Masters** | Ingest no Mux (upload directo ou URL); não servidos pela Vercel |
| **Acesso** | Playback IDs **assinados** (JWT Mux) só com entitlement válido |
| **Prova no repo** | `MuxDemoPlayer` usa `mux-player` e um `playback-id` de demo |

O ID actual no protótipo (`EcHgOK9coz5K4rjSwOkoE7Y7O01201YMIC200RI6lNxnhs`) é **público e só para demo**. Em produção os playback IDs são restritos e o cliente recebe um token de curta duração, emitido na app Next.js (Route Handler ou Server Action) depois de validar sessão e entitlement no **Supabase**. Não há um backend próprio para isto.

## Opções consideradas

### 1. Mux Video (escolhida)

**Prós:** transcoding automático (ABR), CDN, analytics, signed URLs, player acessível, webhooks de `video.asset.ready`; já integrado no ecrã de filme.

**Contras:** custo por minuto armazenado + minutos entregues; lock-in de IDs de asset (mitigado: masters também no Storage do Supabase e/ou no disco da aStudio).

### 2. Cloudflare Stream

**Prós:** preço previsível.

**Contras:** o protótipo já está em Mux; o backend de dados/ficheiros é o Supabase, não a Cloudflare. Reavaliar só se o custo Mux disparar.

### 3. AWS (S3 + MediaConvert + CloudFront + Speke)

**Prós:** controlo e DRM de nível Hollywood.

**Contras:** semanas de integração para um catálogo pequeno. Fora de âmbito.

### 4. Vimeo / Vimeo OTT

**Prós:** conhecido em cinema independente; player e privacy.

**Contras:** menos controlo de entitlements na nossa app; modelo comercial nem sempre TVOD à nossa medida.

### 5. Self-hosted (HLS no Supabase Storage)

**Prós:** custo de storage baixo.

**Contras:** encoding, ABR, players, hotlink e tokens ficam connosco. Risco alto para pirataria e suporte.

## Fluxo de publicação

```text
Master (ProRes/H.264) 
    → upload Mux (asset)
    → webhook video.asset.ready
    → gravar mux_asset_id + playback_id na tabela films (Supabase)
    → poster/stills no Storage do Supabase
```

## Fluxo de visualização

```text
Utilizador autenticado abre /filmes/{slug}
    → Next.js confirma sessão + entitlement no Supabase
    → se válido: a app gera JWT Mux (TTL curto, ex. 15–60 min)
    → mux-player recebe playback-id + token
    → Mux CDN entrega HLS
```

Sem entitlement: UI de compra, sem token, sem segmentos de vídeo.

Guia passo a passo (contas Mux, Direct Upload, webhook, JWT, trailer vs filme, código): [Mux — upload, guardar e reproduzir](../guides/mux-implementacao-upload-reproducao.md).

## Qualidade e restrições

- **On-demand apenas** (`stream-type="on-demand"`), não live.
- Resolução máxima alinhada ao master (1080p por omissão; 4K só se o master e o custo o justificarem).
- Sem download oficial do ficheiro completo no player.
- Watermarking forense Mux: avaliar quando o catálogo tiver títulos com risco comercial maior.

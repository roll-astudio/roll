// Aceita https://stream.mux.com/<id>.m3u8, https://player.mux.com/<id> ou só o <id>.
// Devolve null se o valor não for um URL/ID do Mux.
export function parseMuxPlaybackId(value: string): string | null {
  const match = value.trim().match(/^https?:\/\/(?:[\w-]+\.)?mux\.com\/([A-Za-z0-9]+)/);
  if (match) return match[1];
  return /^[A-Za-z0-9]+$/.test(value.trim()) ? value.trim() : null;
}

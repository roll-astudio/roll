import Mux from "@mux/mux-node";

// Vídeo de demonstração, público e sem DRM
export const DEMO_PLAYBACK_ID = "RXhvaQVhJT94aM1h7dPnPDbXbG5XjgguK5D6Md1hqRY";

// Aceita https://stream.mux.com/<id>.m3u8, https://player.mux.com/<id> ou só o <id>
export function getPlaybackId(videoUrl: string) {
  const match = videoUrl.match(/mux\.com\/([A-Za-z0-9]+)/);
  if (match) return match[1];
  return /^[A-Za-z0-9]+$/.test(videoUrl) ? videoUrl : DEMO_PLAYBACK_ID;
}

export type MuxTokens = {
  playback: string;
  drm: string;
  thumbnail: string;
  storyboard: string;
};

// Tokens JWT de curta duração para um playback ID com política DRM.
// Só deve ser chamado no servidor, depois de validar o acesso do utilizador.
export async function getMuxTokens(playbackId: string): Promise<MuxTokens | null> {
  const { MUX_SIGNING_KEY, MUX_PRIVATE_KEY } = process.env;
  if (!MUX_SIGNING_KEY || !MUX_PRIVATE_KEY || playbackId === DEMO_PLAYBACK_ID) {
    return null;
  }

  const mux = new Mux({
    jwtSigningKey: MUX_SIGNING_KEY,
    jwtPrivateKey: MUX_PRIVATE_KEY,
  });
  const expiration = "2h";

  const [playback, drm, thumbnail, storyboard] = await Promise.all([
    mux.jwt.signPlaybackId(playbackId, { expiration }),
    mux.jwt.signDrmLicense(playbackId, { expiration }),
    mux.jwt.signPlaybackId(playbackId, { expiration, type: "thumbnail" }),
    mux.jwt.signPlaybackId(playbackId, { expiration, type: "storyboard" }),
  ]);

  return { playback, drm, thumbnail, storyboard };
}

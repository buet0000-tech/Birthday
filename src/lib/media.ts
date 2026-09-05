import { useEffect, useState } from "react";

export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;
const mediaUrl = (key: string) => `/api/media?key=${encodeURIComponent(key)}`;

async function errorText(r: Response) {
  const body = await r.json().catch(() => null);
  return body?.error || `Media request failed (${r.status})`;
}

export async function putMedia(key: string, blob: Blob): Promise<void> {
  if (!key) throw new Error("Media key is required.");
  if (blob.size > MAX_MEDIA_BYTES) throw new Error("File too large. Maximum size is 4 MB.");
  const r = await fetch(mediaUrl(key), { method: "PUT", headers: { "content-type": blob.type || "application/octet-stream" }, body: blob });
  if (!r.ok) throw new Error(await errorText(r));
}

export async function getMedia(key: string): Promise<Blob | undefined> {
  if (!key) return undefined;
  const r = await fetch(mediaUrl(key), { cache: "no-store" });
  if (r.status === 404) return undefined;
  if (!r.ok) throw new Error(await errorText(r));
  return r.blob();
}

export async function delMedia(key: string): Promise<void> {
  if (!key) return;
  const r = await fetch(mediaUrl(key), { method: "DELETE" });
  if (!r.ok) throw new Error(await errorText(r));
}

export const newKey = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export async function shrinkImage(file: File, maxSide = 1400, quality = 0.85): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d"); if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h); bitmap.close?.();
    return await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b || file), "image/jpeg", quality));
  } catch { return file; }
}

export function useMediaUrl(key?: string): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let alive = true, objectUrl: string | undefined;
    if (!key) { setUrl(undefined); return; }
    getMedia(key).then(blob => {
      if (!alive || !blob) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => { if (alive) setUrl(undefined); });
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [key]);
  return url;
}

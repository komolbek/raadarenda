const encoder = new TextEncoder();

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return toBase64Url(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signAccessToken(secret: string, ttlMs: number): Promise<string> {
  const exp = Date.now() + ttlMs;
  const payload = String(exp);
  const sig = await hmacSha256(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyAccessToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmacSha256(secret, payload);
  return timingSafeEqual(sig, expected);
}

export async function codeMatches(secret: string, submitted: string, expected: string): Promise<boolean> {
  const [s, e] = await Promise.all([hmacSha256(secret, submitted), hmacSha256(secret, expected)]);
  return timingSafeEqual(s, e);
}

export const ACCESS_COOKIE = 'site_access';
export const ACCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

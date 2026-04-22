import { NextResponse } from 'next/server';
import { ACCESS_COOKIE, ACCESS_TTL_MS, codeMatches, signAccessToken } from '@/lib/gate';

export const runtime = 'edge';

export async function POST(req: Request) {
  const expected = process.env.SITE_ACCESS_CODE;
  const secret = process.env.SITE_ACCESS_SECRET;

  if (!expected || !secret) {
    return NextResponse.json({ ok: false, error: 'gate_not_configured' }, { status: 500 });
  }

  let body: { code?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!code) return NextResponse.json({ ok: false }, { status: 400 });

  const ok = await codeMatches(secret, code, expected);
  if (!ok) return NextResponse.json({ ok: false, error: 'invalid_code' }, { status: 401 });

  const token = await signAccessToken(secret, ACCESS_TTL_MS);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, token, {
    path: '/',
    maxAge: Math.floor(ACCESS_TTL_MS / 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  return res;
}

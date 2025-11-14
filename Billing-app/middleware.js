import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/content')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const isValid = await verifyJwtHs256(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    if (!isValid) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/content/:path*'],
};

// Helpers for HS256 verification (Edge-safe)
async function verifyJwtHs256(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const headerJson = decodeBase64UrlToString(encodedHeader);
    const header = JSON.parse(headerJson);
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return false;

    const payloadJson = decodeBase64UrlToString(encodedPayload);
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() / 1000 >= payload.exp) return false;

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expected = await hmacSha256Base64Url(signingInput, secret);
    return timingSafeEqual(encodedSignature, expected);
  } catch (_) {
    return false;
  }
}

function decodeBase64UrlToString(b64url) {
  const str = atob(base64UrlToBase64(b64url));
  try {
    return decodeURIComponent(
      str.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch {
    return str;
  }
}

function base64UrlToBase64(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad === 2) b64 += '==';
  else if (pad === 3) b64 += '=';
  else if (pad !== 0) b64 += '===';
  return b64;
}

function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return res === 0;
}

async function hmacSha256Base64Url(input, secret) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const data = enc.encode(input);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return toBase64Url(new Uint8Array(sig));
}

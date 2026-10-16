import { createHmac, randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { database, ensureSchema, allowRequest } from './db.js';

const cookieName = 'ras_admin_session';
const sessionDuration = 12 * 60 * 60;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('Admin authentication is not configured. Set a 32-character ADMIN_SESSION_SECRET.');
  }
  return value;
}

function cookieValue(req) {
  const cookie = req.headers.cookie || '';
  return cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
}

function sign(value) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function setSessionCookie(res, email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + sessionDuration })).toString('base64url');
  const value = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', `${cookieName}=${value}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${sessionDuration}`);
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`);
}

export function sessionEmail(req) {
  if (!process.env.ADMIN_SESSION_SECRET || !process.env.ADMIN_EMAIL) return null;
  const value = cookieValue(req);
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (session.exp <= Date.now() / 1000 || session.email !== process.env.ADMIN_EMAIL?.trim().toLowerCase()) return null;
    return session.email;
  } catch {
    return null;
  }
}

export function requireAdmin(req) {
  const email = sessionEmail(req);
  if (!email) {
    const error = new Error('Administrator sign-in is required.');
    error.statusCode = 401;
    throw error;
  }
  return email;
}

export function requireSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (!origin || !host || origin !== `${proto}://${host}`) {
    const error = new Error('Request origin could not be verified.');
    error.statusCode = 403;
    throw error;
  }
}

export async function verifyAdminPassword(req, email, password) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const encoded = process.env.ADMIN_PASSWORD_HASH || '';
  const [algorithm, salt, expectedHash] = encoded.split('$');
  if (!configuredEmail || !salt || !expectedHash || algorithm !== 'scrypt') {
    const error = new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH in the Vercel project to enable admin sign-in.');
    error.statusCode = 503;
    throw error;
  }

  const sql = database();
  await ensureSchema(sql);
  const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const ipHash = createHash('sha256').update(ip).digest('hex');
  if (!(await allowRequest(sql, `login:${ipHash}`, 6, 15))) {
    const error = new Error('Too many sign-in attempts. Wait 15 minutes and try again.');
    error.statusCode = 429;
    throw error;
  }

  const candidate = scryptSync(String(password), Buffer.from(salt, 'base64url'), 64);
  const expected = Buffer.from(expectedHash, 'base64url');
  const matches = expected.length === candidate.length && timingSafeEqual(expected, candidate);
  const emailMatches = String(email).trim().toLowerCase() === configuredEmail;
  if (!matches || !emailMatches) return false;
  await sql`DELETE FROM api_rate_limits WHERE bucket_key = ${`login:${ipHash}`}`;
  return true;
}

export function createPasswordHash(password) {
  const salt = randomBytes(16);
  const digest = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${digest.toString('base64url')}`;
}

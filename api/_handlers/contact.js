import { createHash } from 'node:crypto';
import { database, ensureSchema, allowRequest } from '../_lib/db.js';
import { requireAdmin, requireSameOrigin } from '../_lib/auth.js';
import { requireMethod, sendError } from '../_lib/http.js';

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default async function handler(req, res) {
  try {
    const sql = database();
    await ensureSchema(sql);
    if (req.method === 'GET') {
      requireAdmin(req);
      const rows = await sql`SELECT id,name,email,message,status,created_at FROM join_requests ORDER BY created_at DESC LIMIT 100`;
      return res.status(200).json({ requests: rows });
    }
    requireSameOrigin(req);
    if (req.method === 'POST') {
      const { name, email, message } = req.body || {};
      if (typeof name !== 'string' || name.trim().length < 1 || name.length > 120
        || typeof email !== 'string' || email.length > 254 || !validEmail.test(email.trim())
        || typeof message !== 'string' || message.trim().length < 1 || message.length > 5000) {
        return res.status(400).json({ error: 'Enter a valid name, email address, and message.' });
      }
      const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
      const ipHash = createHash('sha256').update(ip).digest('hex');
      if (!(await allowRequest(sql, `contact:${ipHash}`, 5, 60))) {
        return res.status(429).json({ error: 'Too many messages from this connection. Try again later.' });
      }
      await sql`INSERT INTO join_requests (name,email,message,ip_hash)
        VALUES (${name.trim()},${email.trim()},${message.trim()},${ipHash})`;
      return res.status(201).json({ ok: true });
    }
    if (req.method === 'PATCH') {
      requireAdmin(req);
      requireSameOrigin(req);
      const { id, status } = req.body || {};
      if (typeof id !== 'string' || !['new', 'read', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Contact request update is invalid.' });
      }
      await sql`UPDATE join_requests SET status = ${status} WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }
    return requireMethod(req, res, ['GET', 'POST', 'PATCH']);
  } catch (error) {
    return sendError(res, error);
  }
}

import { database, ensureSchema } from '../_lib/db.js';
import { requireAdmin, requireSameOrigin } from '../_lib/auth.js';
import { requireMethod, sendError } from '../_lib/http.js';
import { put } from '@vercel/blob';

const brandingKeys = new Set(['jssateb', 'ieee', 'ieeeRas']);
const mimeExtensions = new Map([['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp']]);
export default async function handler(req, res) {
  try {
    const sql = database();
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT asset_key, public_url FROM branding_assets`;
      return res.status(200).json({ assets: rows });
    }
    requireAdmin(req);
    requireSameOrigin(req);
    if (!requireMethod(req, res, ['GET', 'POST'])) return;
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const error = new Error('Persistent image storage is not configured. Connect Vercel Blob and set BLOB_READ_WRITE_TOKEN.');
      error.statusCode = 503;
      throw error;
    }
    const { key, fileName, contentType, data } = req.body || {};
    const extension = mimeExtensions.get(contentType);
    if (!(brandingKeys.has(key) || key === 'content') || !extension || typeof data !== 'string' || data.length > 3_800_000) {
      return res.status(400).json({ error: 'Use a PNG, JPG, or WebP image within the upload size limit.' });
    }
    const buffer = Buffer.from(data, 'base64');
    const maxSize = key === 'content' ? 2_800_000 : 2 * 1024 * 1024;
    if (!buffer.length || buffer.length > maxSize) {
      return res.status(400).json({ error: 'Image file is too large or empty.' });
    }
    const name = String(fileName || 'image').replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80);
    const blob = await put(`${key}/${Date.now()}-${name}.${extension}`, buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (key !== 'content') {
      await sql`INSERT INTO branding_assets(asset_key,public_url,updated_at)
        VALUES (${key},${blob.url},now())
        ON CONFLICT(asset_key) DO UPDATE SET public_url=excluded.public_url,updated_at=now()`;
    }
    return res.status(201).json({ url: blob.url });
  } catch (error) {
    return sendError(res, error);
  }
}

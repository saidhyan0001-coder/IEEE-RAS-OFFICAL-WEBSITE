import { database, ensureSchema } from '../_lib/db.js';
import { requireAdmin, requireSameOrigin } from '../_lib/auth.js';
import { requireMethod, sendError } from '../_lib/http.js';

const categories = new Set(['about', 'boards', 'societies', 'team', 'gallery', 'events', 'announcements']);
const contentFieldsAreValid = ({ category, title, role, summary, body, event_date, image_path, published }) =>
  categories.has(category)
  && typeof title === 'string' && title.trim().length > 0 && title.length <= 180
  && typeof role === 'string' && role.length <= 120
  && typeof summary === 'string' && summary.length <= 1000
  && typeof body === 'string' && body.length <= 10000
  && (event_date === null || event_date === '' || (typeof event_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event_date) && !Number.isNaN(Date.parse(`${event_date}T00:00:00Z`))))
  && (image_path === null || (typeof image_path === 'string' && image_path.length <= 2048 && /^https:\/\/\S+$/.test(image_path)))
  && typeof published === 'boolean';

export default async function handler(req, res) {
  try {
    const sql = database();
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const category = String(req.query.category || '');
      if (!categories.has(category)) return res.status(400).json({ error: 'Unknown content section.' });
      const adminView = req.query.admin === '1';
      if (adminView) requireAdmin(req);
      const rows = adminView
        ? await sql`SELECT id, category, title, summary, body, role, image_path, event_date, display_order, published, created_at FROM site_content WHERE category = ${category} ORDER BY display_order, created_at DESC LIMIT 200`
        : await sql`SELECT id, category, title, summary, body, role, image_path, event_date, display_order, published, created_at FROM site_content WHERE category = ${category} AND published = true ORDER BY display_order, created_at DESC LIMIT 200`;
      return res.status(200).json({ items: rows.map((item) => ({ ...item, image_url: item.image_path })) });
    }

    requireAdmin(req);
    requireSameOrigin(req);
    if (req.method === 'POST') {
      const entry = { role: '', summary: '', body: '', event_date: null, image_path: null, published: false, ...req.body };
      if (!contentFieldsAreValid(entry)) {
        return res.status(400).json({ error: 'Content fields are invalid or exceed their allowed length.' });
      }
      const result = await sql`
        INSERT INTO site_content (category,title,summary,body,role,event_date,image_path,published)
        VALUES (${entry.category},${entry.title.trim()},${entry.summary.trim()},${entry.body.trim()},${entry.role.trim()},${entry.event_date || null},${entry.image_path || null},${entry.published})
        RETURNING id`;
      return res.status(201).json({ id: result[0].id });
    }
    if (req.method === 'PATCH') {
      const { id } = req.body || {};
      if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Content id is invalid.' });
      }
      if (typeof req.body.published === 'boolean' && Object.keys(req.body).length === 2) {
        await sql`UPDATE site_content SET published = ${req.body.published}, updated_at = now() WHERE id = ${id}`;
        return res.status(200).json({ ok: true });
      }
      const entry = { role: '', summary: '', body: '', event_date: null, image_path: null, published: false, ...req.body };
      if (!contentFieldsAreValid(entry)) return res.status(400).json({ error: 'Content fields are invalid or exceed their allowed length.' });
      const result = await sql`
        UPDATE site_content SET
          category = ${entry.category},
          title = ${entry.title.trim()},
          summary = ${entry.summary.trim()},
          body = ${entry.body.trim()},
          role = ${entry.role.trim()},
          event_date = ${entry.event_date || null},
          image_path = ${entry.image_path || null},
          published = ${entry.published},
          updated_at = now()
        WHERE id = ${id}
        RETURNING id`;
      if (!result.length) return res.status(404).json({ error: 'Content entry was not found.' });
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Content id is invalid.' });
      }
      await sql`DELETE FROM site_content WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }
    return requireMethod(req, res, ['GET', 'POST', 'PATCH', 'DELETE']);
  } catch (error) {
    return sendError(res, error);
  }
}

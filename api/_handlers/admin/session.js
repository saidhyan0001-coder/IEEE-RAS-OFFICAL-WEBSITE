import { sessionEmail } from '../../_lib/auth.js';
import { requireMethod } from '../../_lib/http.js';

export default function sessionHandler(req, res) {
  if (!requireMethod(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ user: sessionEmail(req) ? { email: sessionEmail(req) } : null });
}

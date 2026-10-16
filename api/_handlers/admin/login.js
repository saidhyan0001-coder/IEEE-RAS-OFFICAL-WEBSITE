import { setSessionCookie, verifyAdminPassword, requireSameOrigin } from '../../_lib/auth.js';
import { requireMethod, sendError } from '../../_lib/http.js';

export default async function loginHandler(req, res) {
  if (!requireMethod(req, res, ['POST'])) return;
  try {
    requireSameOrigin(req);
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || password.length > 1024) {
      return res.status(400).json({ error: 'Enter a valid administrator email and password.' });
    }
    if (!(await verifyAdminPassword(req, email, password))) {
      return res.status(401).json({ error: 'The email or password is incorrect.' });
    }
    const userEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    setSessionCookie(res, userEmail);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ user: { email: userEmail } });
  } catch (error) {
    return sendError(res, error);
  }
}

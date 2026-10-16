import { clearSessionCookie, requireSameOrigin } from '../../_lib/auth.js';
import { requireMethod, sendError } from '../../_lib/http.js';

export default function logoutHandler(req, res) {
  if (!requireMethod(req, res, ['POST'])) return;
  try {
    requireSameOrigin(req);
    clearSessionCookie(res);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendError(res, error);
  }
}

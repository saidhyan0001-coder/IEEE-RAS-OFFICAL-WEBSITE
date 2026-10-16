import express from 'express';
import healthHandler from './_handlers/health.js';
import contentHandler from './_handlers/content.js';
import contactHandler from './_handlers/contact.js';
import brandingHandler from './_handlers/branding.js';
import loginHandler from './_handlers/admin/login.js';
import logoutHandler from './_handlers/admin/logout.js';
import sessionHandler from './_handlers/admin/session.js';

const app = express();

app.disable('x-powered-by');
app.use((req, _res, next) => {
  if (req.url === '/api') {
    req.url = '/';
  } else if (req.url.startsWith('/api/')) {
    req.url = req.url.slice('/api'.length);
  }
  next();
});
app.use((req, res, next) => {
  const limit = req.path === '/contact' ? '16kb' : '4mb';
  express.json({ limit })(req, res, next);
});

app.all('/health', healthHandler);
app.all('/content', contentHandler);
app.all('/contact', contactHandler);
app.all('/branding', brandingHandler);
app.all('/admin/login', loginHandler);
app.all('/admin/logout', logoutHandler);
app.all('/admin/session', sessionHandler);

app.use((_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

app.use((error, _req, res, _next) => {
  const status = error.status === 413 ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
  if (status === 500) {
    console.error('Express request failed', {
      errorName: typeof error.name === 'string' ? error.name : 'Error',
      errorCode: typeof error.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? error.code : undefined,
    });
  }
  res.status(status).json({
    error: status === 413
      ? 'Request body is too large.'
      : status === 400
        ? 'Invalid JSON'
        : 'The server could not complete the request. Check backend configuration and logs.',
  });
});

export const config = { api: { bodyParser: false } };
export default app;

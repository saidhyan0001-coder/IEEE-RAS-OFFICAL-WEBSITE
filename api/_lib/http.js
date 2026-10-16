export function sendError(res, error) {
  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  if (status >= 500) {
    console.error('API request failed', {
      errorName: typeof error.name === 'string' ? error.name : 'Error',
      errorCode: typeof error.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? error.code : undefined,
    });
  }
  res.status(status).json({
    error: status >= 500 && status === 500
      ? 'The server could not complete the request. Check backend configuration and logs.'
      : error.message,
  });
}

export function requireMethod(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    res.status(405).json({ error: 'Method not allowed.' });
    return false;
  }
  return true;
}

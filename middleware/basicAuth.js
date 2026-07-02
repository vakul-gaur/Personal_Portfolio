module.exports = function basicAuth(req, res, next) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return res.status(503).send('Admin panel is not configured.');
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).send('Authentication required.');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [reqUser, reqPass] = credentials.split(':');

  if (reqUser === user && reqPass === pass) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin Panel"');
  return res.status(401).send('Invalid credentials.');
};

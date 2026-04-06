const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getUserIdFromAuthHeader(authorization) {
  if (!authorization || !String(authorization).startsWith('Bearer ')) return null;
  const token = String(authorization).slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.userId || null;
  } catch {
    return null;
  }
}

function getUserIdFromRequest(req) {
  return getUserIdFromAuthHeader(req.headers?.authorization);
}

module.exports = { JWT_SECRET, getUserIdFromRequest, getUserIdFromAuthHeader };

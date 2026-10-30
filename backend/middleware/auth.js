const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

async function authenticate(req, res, next) {
  try {
    const token = req.cookies[process.env.COOKIE_NAME || 'portal_session'];
    if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const Model = payload.role === 'admin' ? Admin : Student;
    const account = await Model.findById(payload.sub);
    if (!account || (account.status && account.status !== 'active') || (account.active === false)) {
      return res.status(401).json({ message: 'Account unavailable. Please contact support.' });
    }
    req.account = account;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or expired. Please log in again.' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.role)
    ? next()
    : res.status(403).json({ message: 'You are not authorized to perform this action.' });
}

function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const cookie = req.cookies[process.env.CSRF_COOKIE_NAME || 'portal_csrf'];
  const header = req.get('x-csrf-token');
  if (!cookie || !header || cookie !== header) {
    return res.status(403).json({ message: 'CSRF validation failed. Refresh and try again.' });
  }
  next();
}
module.exports = { authenticate, allowRoles, csrfProtection };

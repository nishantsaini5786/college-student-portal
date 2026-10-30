const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const registration = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(1).max(60),
  dob: z.string().min(8),
  gender: z.enum(['Male','Female','Other','Prefer not to say']),
  fatherName: z.string().trim().min(2).max(100),
  motherName: z.string().trim().min(2).max(100),
  parentMobile: z.string().regex(/^[0-9+() -]{7,20}$/),
  alternativeParentContact: z.string().optional().default(''),
  mobile: z.string().regex(/^[0-9+() -]{7,20}$/),
  email: z.string().email().max(254),
  address: z.string().trim().min(5).max(500),
  alternativeAddress: z.string().max(500).optional().default(''),
  course: z.enum(['BCA','BBA','BSc','BCom','BA','BTech','MCA','MBA','Other']),
  batch: z.string().regex(/^20\d{2}-20\d{2}$/),
  admissionYear: z.coerce.number().int().min(2000).max(2100),
  currentSemester: z.coerce.number().int().min(1).max(12),
  academicSession: z.string().min(4).max(30),
  password: z.string().min(12).max(72).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/)
});

function cookieOptions() {
  const sameSite = process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax');
  return {
    httpOnly: true, secure: process.env.COOKIE_SECURE === 'true',
    sameSite, domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/', maxAge: 24 * 60 * 60 * 1000
  };
}
function setSession(res, account, role) {
  const token = jwt.sign({ sub: account._id.toString(), role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  const csrf = require('crypto').randomBytes(24).toString('hex');
  res.cookie(process.env.COOKIE_NAME || 'portal_session', token, cookieOptions());
  res.cookie(process.env.CSRF_COOKIE_NAME || 'portal_csrf', csrf, {
    httpOnly: false, secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined, path: '/', maxAge: 24 * 60 * 60 * 1000
  });
}
function clearSession(res) {
  const opts = cookieOptions(); delete opts.maxAge;
  res.clearCookie(process.env.COOKIE_NAME || 'portal_session', opts);
  res.clearCookie(process.env.CSRF_COOKIE_NAME || 'portal_csrf', { ...opts, httpOnly: false });
}

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registration.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Please check the form fields. Password must be at least 12 characters and include uppercase, lowercase, number and symbol.', errors: parsed.error.flatten().fieldErrors });
    const data = parsed.data;
    data.email = data.email.toLowerCase();
    if (await Student.exists({ email: data.email })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(data.password, 12);
    delete data.password;
    const year = new Date().getFullYear();
    const enrollmentNumber = `CSP${year}${require('crypto').randomBytes(4).toString('hex').toUpperCase()}`;
    const student = await Student.create({ ...data, enrollmentNumber, passwordHash });
    setSession(res, student, 'student');
    res.status(201).json({ message: 'Registration successful.', user: { id: student.id, name: `${student.firstName} ${student.lastName}`, enrollmentNumber: student.enrollmentNumber, role: 'student' } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password || email.length > 254 || password.length > 72) return res.status(400).json({ message: 'Enter a valid email and password.' });
    const student = await Student.findOne({ email }).select('+passwordHash');
    if (!student || !(await bcrypt.compare(password, student.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
    if (student.status !== 'active') return res.status(403).json({ message: 'Your account is inactive. Contact college administration.' });
    setSession(res, student, 'student');
    res.json({ message: 'Login successful.', user: { id: student.id, name: `${student.firstName} ${student.lastName}`, role: 'student' } });
  } catch (err) { next(err); }
});

router.post('/admin/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const admin = await Admin.findOne({ email }).select('+passwordHash');
    if (!admin || !admin.active || !(await bcrypt.compare(password, admin.passwordHash))) return res.status(401).json({ message: 'Invalid admin credentials.' });
    setSession(res, admin, 'admin');
    res.json({ message: 'Admin login successful.', user: { id: admin.id, name: admin.name, role: 'admin' } });
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => { clearSession(res); res.json({ message: 'Logged out successfully.' }); });
module.exports = router;

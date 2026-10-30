const router = require('express').Router();
const Student = require('../models/Student');
const { Attendance, Result, Fee, Examination, Notice } = require('../models/AcademicRecord');
const { authenticate, allowRoles } = require('../middleware/auth');

router.use(authenticate, allowRoles('student'));

router.get('/me', async (req, res) => {
  const student = await Student.findById(req.account.id).select('-passwordHash');
  res.json({ student });
});

router.patch('/me', async (req, res) => {
  const allowed = ['mobile', 'address', 'alternativeAddress', 'alternativeParentContact'];
  const updates = {};
  for (const key of allowed) if (typeof req.body[key] === 'string') updates[key] = req.body[key].trim();
  if (updates.mobile && !/^[0-9+() -]{7,20}$/.test(updates.mobile)) return res.status(400).json({ message: 'Invalid mobile number.' });
  if (updates.address && updates.address.length < 5) return res.status(400).json({ message: 'Address is too short.' });
  const student = await Student.findByIdAndUpdate(req.account.id, { $set: updates }, { new: true, runValidators: true }).select('-passwordHash');
  res.json({ message: 'Profile updated.', student });
});

router.get('/dashboard', async (req, res) => {
  const studentId = req.account.id;
  const student = await Student.findById(studentId).select('firstName lastName enrollmentNumber course batch currentSemester academicSession profilePhotoUrl');
  const [attendance, results, fees, exams, notices] = await Promise.all([
    Attendance.find({ student: studentId }).lean(),
    Result.find({ student: studentId }).sort({ semester: -1 }).limit(20).lean(),
    Fee.find({ student: studentId }).sort({ dueDate: 1 }).lean(),
    Examination.find({ $or: [{ student: studentId }, { student: null, course: student.course }] }).sort({ examDate: 1 }).limit(5).lean(),
    Notice.find({ active: true, audienceCourse: { $in: ['All', student.course] } }).sort({ publishedAt: -1 }).limit(5).lean()
  ]);
  const held = attendance.reduce((n, x) => n + x.classesHeld, 0);
  const attended = attendance.reduce((n, x) => n + x.classesAttended, 0);
  const totalFees = fees.reduce((n, x) => n + x.amount, 0);
  const paidFees = fees.reduce((n, x) => n + x.paidAmount, 0);
  res.json({
    student,
    attendance: { classesHeld: held, classesAttended: attended, percentage: held ? Math.round(attended / held * 100) : null },
    results,
    fees: { total: totalFees, paid: paidFees, pending: Math.max(0, totalFees - paidFees), records: fees },
    examinations: exams,
    announcements: notices
  });
});

router.get('/attendance', async (req, res) => res.json({ records: await Attendance.find({ student: req.account.id }).sort({ semester: 1, subjectName: 1 }).lean() }));
router.get('/results', async (req, res) => res.json({ records: await Result.find({ student: req.account.id }).sort({ semester: 1 }).lean() }));
router.get('/fees', async (req, res) => res.json({ records: await Fee.find({ student: req.account.id }).sort({ dueDate: 1 }).lean() }));
router.get('/examinations', async (req, res) => {
  const student = await Student.findById(req.account.id).select('course');
  res.json({ records: await Examination.find({ $or: [{ student: req.account.id }, { student: null, course: student.course }] }).sort({ examDate: 1 }).lean() });
});
router.get('/notifications', async (req, res) => {
  const student = await Student.findById(req.account.id).select('course');
  res.json({ records: await Notice.find({ active: true, audienceCourse: { $in: ['All', student.course] } }).sort({ publishedAt: -1 }).lean() });
});
module.exports = router;

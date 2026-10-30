const router = require('express').Router();
const Student = require('../models/Student');
const { Attendance, Result, Fee, Examination, Notice } = require('../models/AcademicRecord');
const { authenticate, allowRoles } = require('../middleware/auth');

router.use(authenticate, allowRoles('admin'));

router.get('/overview', async (req, res) => {
  const [students, active, attendanceRecords, feeRecords] = await Promise.all([
    Student.countDocuments(), Student.countDocuments({ status: 'active' }),
    Attendance.countDocuments(), Fee.countDocuments()
  ]);
  res.json({ students, activeStudents: active, attendanceRecords, feeRecords });
});

router.get('/students', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const filter = {};
  if (req.query.course) filter.course = String(req.query.course);
  if (req.query.batch) filter.batch = String(req.query.batch);
  if (req.query.q) {
    const q = String(req.query.q).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ firstName: new RegExp(q, 'i') }, { lastName: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { enrollmentNumber: new RegExp(q, 'i') }];
  }
  const [records, total] = await Promise.all([
    Student.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Student.countDocuments(filter)
  ]);
  res.json({ records, page, limit, total });
});

router.patch('/students/:id/academic', async (req, res) => {
  const allowed = ['course','batch','admissionYear','currentSemester','academicSession','status'];
  const updates = {};
  for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
  const student = await Student.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).select('-passwordHash');
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  res.json({ message: 'Academic record updated.', student });
});

router.post('/attendance', async (req, res) => {
  const { student, semester, subjectCode, subjectName, classesHeld, classesAttended, month } = req.body;
  if (!student || !subjectCode || !subjectName || !Number.isInteger(Number(semester)) ||
      !Number.isInteger(Number(classesHeld)) || !Number.isInteger(Number(classesAttended)) ||
      Number(classesAttended) > Number(classesHeld) || Number(classesHeld) < 0) {
    return res.status(400).json({ message: 'Invalid attendance data.' });
  }
  res.status(201).json({ record: await Attendance.create({ student, semester, subjectCode, subjectName, classesHeld, classesAttended, month }) });
});
router.post('/results', async (req, res) => {
  const { student, semester, subjectCode, subjectName, credits, internalMarks, externalMarks, totalMarks, grade, sgpa, status } = req.body;
  if (!student || !subjectCode || !subjectName) return res.status(400).json({ message: 'Student and subject details are required.' });
  res.status(201).json({ record: await Result.create({ student, semester, subjectCode, subjectName, credits, internalMarks, externalMarks, totalMarks, grade, sgpa, status }) });
});
router.post('/fees', async (req, res) => {
  const { student, semester, description, amount, paidAmount, dueDate, status, reference } = req.body;
  if (!student || !Number.isFinite(Number(amount)) || Number(amount) < 0 || Number(paidAmount || 0) > Number(amount)) return res.status(400).json({ message: 'Invalid fee record.' });
  res.status(201).json({ record: await Fee.create({ student, semester, description, amount, paidAmount, dueDate, status, reference }) });
});
router.post('/examinations', async (req, res) => res.status(201).json({ record: await Examination.create(req.body) }));
router.post('/announcements', async (req, res) => {
  if (!req.body.title || !req.body.message) return res.status(400).json({ message: 'Title and message are required.' });
  res.status(201).json({ record: await Notice.create({ title: req.body.title, message: req.body.message, audienceCourse: req.body.audienceCourse || 'All' }) });
});
module.exports = router;

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  semester: { type: Number, required: true },
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  classesHeld: { type: Number, default: 0, min: 0 },
  classesAttended: { type: Number, default: 0, min: 0 },
  month: { type: String, default: '' }
}, { timestamps: true });

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  semester: { type: Number, required: true },
  subjectCode: String, subjectName: String,
  credits: { type: Number, default: 0 },
  internalMarks: { type: Number, default: 0 },
  externalMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  grade: String, sgpa: Number,
  status: { type: String, enum: ['Pass','Fail','Pending'], default: 'Pending' }
}, { timestamps: true });

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  semester: Number, description: String,
  amount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  dueDate: Date,
  status: { type: String, enum: ['Pending','Partially Paid','Paid'], default: 'Pending' },
  reference: String
}, { timestamps: true });

const examSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true },
  course: String, semester: Number, subjectCode: String, subjectName: String,
  examDate: Date, examTime: String, hall: String
}, { timestamps: true });

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  audienceCourse: { type: String, default: 'All' },
  publishedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = {
  Attendance: mongoose.model('Attendance', attendanceSchema),
  Result: mongoose.model('Result', resultSchema),
  Fee: mongoose.model('Fee', feeSchema),
  Examination: mongoose.model('Examination', examSchema),
  Notice: mongoose.model('Notice', noticeSchema)
};

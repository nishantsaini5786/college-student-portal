const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  enrollmentNumber: { type: String, unique: true, index: true },
  firstName: { type: String, required: true, trim: true, maxlength: 60 },
  lastName: { type: String, required: true, trim: true, maxlength: 60 },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], required: true },
  fatherName: { type: String, required: true, trim: true, maxlength: 100 },
  motherName: { type: String, required: true, trim: true, maxlength: 100 },
  parentMobile: { type: String, required: true, match: /^[0-9+() -]{7,20}$/ },
  alternativeParentContact: { type: String, default: '' },
  mobile: { type: String, required: true, match: /^[0-9+() -]{7,20}$/ },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  address: { type: String, required: true, maxlength: 500 },
  alternativeAddress: { type: String, default: '', maxlength: 500 },
  course: { type: String, required: true, enum: ['BCA','BBA','BSc','BCom','BA','BTech','MCA','MBA','Other'] },
  batch: { type: String, required: true, match: /^20\d{2}-20\d{2}$/ },
  admissionYear: { type: Number, required: true, min: 2000, max: 2100 },
  currentSemester: { type: Number, required: true, min: 1, max: 12 },
  academicSession: { type: String, required: true, maxlength: 30 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student'], default: 'student' },
  status: { type: String, enum: ['active','inactive'], default: 'active' },
  profilePhotoUrl: { type: String, default: '' }
}, { timestamps: true });

studentSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Student', studentSchema);

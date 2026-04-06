const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Admin', 'HOD', 'Faculty', 'Student', 'Auditor'] },
  department: { type: String, default: "" }
});

module.exports = mongoose.model('User', UserSchema);

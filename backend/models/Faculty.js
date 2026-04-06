const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  qualification: { type: String, required: true },
  publications: { type: Number, default: 0 },
  teachingWorkload: { type: String, default: "" },
  department: { type: String, required: true }
});

module.exports = mongoose.model('Faculty', FacultySchema);

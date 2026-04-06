const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  syllabus: { type: String, required: true },
  coPoMapping: { type: String, default: "" }
});

module.exports = mongoose.model('Course', CourseSchema);

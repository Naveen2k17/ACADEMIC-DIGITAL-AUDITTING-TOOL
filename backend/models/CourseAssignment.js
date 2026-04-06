const mongoose = require('mongoose');

const CourseAssignmentSchema = new mongoose.Schema({
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  courseName: { type: String, required: true },
  semester: { type: String, required: true },
  section: { type: String, required: true },
  students: [{ 
    studentId: String, 
    studentName: String,
    attendance: { type: Number, default: 0 },
    grade: { type: String, default: "" }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseAssignment', CourseAssignmentSchema);

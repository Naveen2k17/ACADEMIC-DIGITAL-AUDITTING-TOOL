const mongoose = require('mongoose');

const SyllabusApprovalSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  syllabus: { type: String, required: true },
  coPoMapping: { type: String, default: "" },
  submittedBy: { type: String, required: true },
  submittedById: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Update Requested"], default: "Pending" },
  remarks: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date
});

module.exports = mongoose.model('SyllabusApproval', SyllabusApprovalSchema);

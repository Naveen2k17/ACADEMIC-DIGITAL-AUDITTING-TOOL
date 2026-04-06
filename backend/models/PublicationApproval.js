const mongoose = require('mongoose');

const PublicationApprovalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  journal: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Correction Requested"], default: "Pending" },
  remarks: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date
});

module.exports = mongoose.model('PublicationApproval', PublicationApprovalSchema);

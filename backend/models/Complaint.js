const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Resolved", "Work Done"], default: "Pending" },
  raisedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);

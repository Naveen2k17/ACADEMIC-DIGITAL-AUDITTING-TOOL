const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  attendance: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  results: { type: String, default: "" },
  department: { type: String, required: true },
  year: { type: Number, required: true }
});

module.exports = mongoose.model('Student', StudentSchema);

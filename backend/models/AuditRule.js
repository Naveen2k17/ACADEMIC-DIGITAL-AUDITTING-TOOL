const mongoose = require('mongoose');

const AuditRuleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true },
  type: { type: String, enum: ["attendance", "credits"], default: "attendance" },
  threshold: { type: Number, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditRule', AuditRuleSchema);

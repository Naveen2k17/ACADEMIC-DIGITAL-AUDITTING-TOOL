const mongoose = require('mongoose');

const InfrastructureSchema = new mongoose.Schema({
  labName: { type: String, required: true },
  equipment: { type: String, required: true },
  capacity: { type: Number, default: 0 },
  location: { type: String, default: "" },
  status: { type: String, default: "Functional" }
});

module.exports = mongoose.model('Infrastructure', InfrastructureSchema);

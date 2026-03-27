




const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Guide ki ID
  guideName: String,
  members: [{ 
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    name: String,
    email: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', TeamSchema);
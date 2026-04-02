



const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  guideId: { type: String }, // 👈 Strict 'ObjectId' ko hatakar 'String' kiya
  guideName: { type: String },
  members: [{ 
    studentId: { type: String }, // 👈 Strict 'ObjectId' ko hatakar 'String' kiya
    name: String,
    email: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
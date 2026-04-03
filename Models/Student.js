










// Backend/Models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
 role: {
    type: String,
    // Sare naye roles yahan add kar dijiye
    enum: ['fresher', 'student_exp', 'guide', 'guide_exp', 'experienced'], 
    default: 'fresher'
},
  
  // --- Naye Fields Jo Guide ne bole hain ---
  isAvailable: { type: Boolean, default: true }, 
  notifications: [{
    message: String,
    projectName: String,
    guideName: String,
    date: { type: Date, default: Date.now }
  }],
  currentProject: { type: String, default: null } 
});

module.exports = mongoose.model('Student', StudentSchema);

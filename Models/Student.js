


// const mongoose = require('mongoose');

// const StudentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true }, 
//   password: { type: String, required: true }, 
  
//   // Dono role fields ko mila kar sirf ye ek rakhein
//   role: { 
//     type: String, 
//     enum: ['fresher', 'experienced', 'student', 'guide'], 
//     default: 'fresher' 
//   },

//   skills: [String],
//   projects: String
// });

// module.exports = mongoose.model('Student', StudentSchema);











// Backend/Models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['fresher', 'experienced'], default: 'fresher' },
  skills: [String],
  projects: String,
  
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

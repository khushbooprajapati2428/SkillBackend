


const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }, 
  
  // Dono role fields ko mila kar sirf ye ek rakhein
  role: { 
    type: String, 
    enum: ['fresher', 'experienced', 'student', 'guide'], 
    default: 'fresher' 
  },

  skills: [String],
  projects: String
});

module.exports = mongoose.model('Student', StudentSchema);


//node JavaScript/Server.js   server start karne ki command.


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🛠️ Model Imports (Sahi Path ke saath)
const Student = require('../Models/Student'); 
const Team = require('../Models/Team'); 

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.log("❌ DB Error:", err));


// 1. Home Route (Sirf ek baar)
app.get('/', (req, res) => {
    res.send('Skill Sentry API is running...');
});

// 2. Registration API (Email check ke saath)
app.post('/api/register', async (req, res) => {
    try {
        const existingUser = await Student.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: "The email is already registered!" });
        }
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.status(201).json({ message: "Student Data Saved Successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});



// 3. Login API (Ise update karein)
// Server.js - API Finalize Team aur Login Update
app.post('/api/finalize-team', async (req, res) => { 
    try {
        const { projectName, guideName, selectedMembers } = req.body;

        // Sirf unhi students ki IDs nikalna jo selected hain
        const memberIds = selectedMembers.map(m => m._id);
        
        // 1. Students ko update karein
        await Student.updateMany(
            { _id: { $in: memberIds } },
            { 
                $set: { isAvailable: false, currentProject: projectName },
                $push: { 
                    notifications: { 
                        message: `Congratulations! You are selected for ${projectName}`,
                        projectName: projectName,
                        guideName: guideName,
                        date: new Date()
                    }
                }
            }
        );

        // 2. Team History save karein
        const newTeam = new Team({
            projectName,
            guideName,
            members: selectedMembers.map(m => ({ 
                studentId: m._id, 
                name: m.name, 
                email: m.email 
            }))
        });

        await newTeam.save();
        res.status(200).json({ message: "Team Finalized and Students Notified!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Students Data API (Jo dashboard load karega)
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find(); 
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Server.js mein check karein
// 🚀 'async' keyword yahan hona bahut zaroori hai
app.post('/api/finalize-team', async (req, res) => { 
    try {
        const { projectName, guideName, selectedMembers } = req.body;

        // 1. Students update logic...
        const memberIds = selectedMembers.map(m => m._id || m.id);
        
        await Student.updateMany(
            { _id: { $in: memberIds } },
            { 
                $set: { isAvailable: false, currentProject: projectName },
                $push: { 
                    notifications: { 
                        message: `Congratulations! You are selected for ${projectName}`,
                        projectName: projectName,
                        guideName: guideName,
                        date: new Date()
                    }
                }
            }
        );

        // 2. Team save logic
        const newTeam = new Team({
            projectName,
            guideName,
            members: selectedMembers.map(m => ({ 
                studentId: m._id || m.id, 
                name: m.name, 
                email: m.email 
            }))
        });

        await newTeam.save(); // 👈 Ab ye 'await' kaam karega!

        res.status(200).json({ message: "Team Finalized and Students Notified!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 5. Guide Teams History API
app.get('/api/guide-teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ createdAt: -1 }); // Nayi teams upar dikhengi
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json(err);
    }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
}); 
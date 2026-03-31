
//node JavaScript/Server.js   server start karne ki command.



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// 1. Middlewares (CORS Fix ke saath)
// app.use(cors({
//     origin: "http://localhost:1234", 
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
// }));
// Server.js mein isse replace karein
app.use(cors({
    origin: "*", // 👈 Ye sabhi request allow karega (Testing ke liye best hai)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// 2. Model Imports
const Student = require('../Models/Student'); 
const Team = require('../Models/Team'); 

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.log("❌ DB Error:", err));

// --- API ROUTES ---

// Home Route
app.get('/', (req, res) => {
    res.send('Skill Sentry API is running...');
});

// Registration API
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




// Ise Server.js mein daalein (Purane login route ko hata kar)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for:", email); // Terminal mein dikhega

        const user = await Student.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        res.status(200).json({ message: "Login Successful!", user });
    } catch (err) {
        console.error("Login Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Finalize Team API (Only 1 time, Clean logic)
// app.post('/api/finalize-team', async (req, res) => { 
//     try {
//         const { projectName, guideName, selectedMembers } = req.body;

//         const memberIds = selectedMembers.map(m => m._id || m.id);
        
//         // Update Students: notification push aur availability change
//         await Student.updateMany(
//             { _id: { $in: memberIds } },
//             { 
//                 $set: { isAvailable: false, currentProject: projectName },
//                 $push: { 
//                     notifications: { 
//                         message: `Congratulations! You are selected for ${projectName}`,
//                         projectName: projectName,
//                         guideName: guideName,
//                         date: new Date()
//                     }
//                 }
//             }
//         );

// Server.js mein finalize-team ka logic
app.post('/api/finalize-team', async (req, res) => { 
    try {
        const { projectName, guideName, selectedMembers } = req.body;

        // 1. Saare selected students ki IDs nikalna
        const memberIds = selectedMembers.map(m => m._id || m.id);
        
        // 2. Ek saath sabko Update karna (Notification + Availability)
        await Student.updateMany(
            { _id: { $in: memberIds } }, // 👈 Ye "In" operator sabhi 5-6 students ko dhund lega
            { 
                $set: { isAvailable: false, currentProject: projectName },
                $push: { 
                    notifications: { 
                        message: `Congratulations! You are selected for ${projectName} by ${guideName}`,
                        projectName: projectName,
                        guideName: guideName,
                        date: new Date()
                    }
                }
            }
        );

        // 3. Team history mein bhi save karna
        const newTeam = new Team({
            projectName,
            guideName,
            members: selectedMembers.map(m => ({ 
                studentId: m._id || m.id, 
                name: m.name, 
                email: m.email 
            }))
        });

        await newTeam.save();
        res.status(200).json({ message: "Team Finalized and All Students Notified!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
        
   

// Get All Students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find(); 
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Guide Teams History
app.get('/api/guide-teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ createdAt: -1 });
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
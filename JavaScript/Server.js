
//node JavaScript/Server.js   server start karne ki command.



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

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


app.post('/api/finalize-team', async (req, res) => { 
    try {
        const { projectName, guideName, selectedMembers, guideId } = req.body;

        // 1. Team Data taiyar karna (Sab kuch String mein convert karke)
        const teamData = {
            projectName: projectName,
            guideName: guideName,
            guideId: String(guideId || "dummy-id"),
            members: selectedMembers.map(m => ({
                studentId: String(m._id || m.id), 
                name: m.name,
                email: m.email
            })),
            createdAt: new Date()
        };

        // 🚀 MASTER STROKE: Model validation bypass karke direct save karna
        // Isse "Cast to ObjectId" wala error kabhi nahi aayega
        await mongoose.connection.collection('teams').insertOne(teamData);

        // 2. Notification Logic (Sirf Real IDs ke liye - 24 chars)
        const realMemberIds = selectedMembers
            .map(m => m._id || m.id)
            .filter(id => id && id.length === 24);

        if (realMemberIds.length > 0) {
            const studentIds = realMemberIds.map(id => new mongoose.Types.ObjectId(id));
            await mongoose.connection.collection('students').updateMany(
                { _id: { $in: studentIds } },
                { 
                    $push: { 
                        notifications: { 
                            message: `Congratulations! Selected for ${projectName}`,
                            projectName, guideName, date: new Date()
                        }
                    }
                }
            );
        }

        res.status(200).json({ message: "Team locked successfully! Notification sent to real users." });

    } catch (err) {
        console.error("Final Error:", err);
        res.status(500).json({ error: "Server Error: " + err.message });
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
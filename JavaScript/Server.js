
//node JavaScript/Server.js   server start karne ki command.


const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.log("❌ DB Error:", err));

// Model Import
const Student = require('../Models/Student'); 

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

// 3. Login API (Clean version)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Student.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        res.status(200).json({ 
            message: "Login Successful!", 
            user: { name: user.name, email: user.email } 
        });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
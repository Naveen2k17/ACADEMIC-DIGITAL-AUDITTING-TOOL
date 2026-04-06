const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAuditor() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const existingAuditor = await User.findOne({ email: 'auditor@example.com' });
        if (existingAuditor) {
            console.log("Auditor already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('auditor123', 10);
        const auditor = new User({
            name: 'System Auditor',
            email: 'auditor@example.com',
            password: hashedPassword,
            role: 'Auditor',
            department: 'Quality Assurance'
        });

        await auditor.save();
        console.log("Auditor created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("FULL ERROR DETAILS:", error);
        process.exit(1);
    }
}

createAuditor();

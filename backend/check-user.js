const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'auditor@example.com' });
        if (user) {
            console.log("User found:", user.email, "Role:", user.role);
        } else {
            console.log("User not found");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkUser();

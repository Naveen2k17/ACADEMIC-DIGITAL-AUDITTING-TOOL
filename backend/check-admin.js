require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: 'admin@audit.com' });
        if (!admin) {
            console.log('Admin user not found!');
        } else {
            console.log('Admin found:', admin.email);
            const isMatch = await bcrypt.compare('admin123', admin.password);
            console.log('Password match for admin123:', isMatch);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkAdmin();

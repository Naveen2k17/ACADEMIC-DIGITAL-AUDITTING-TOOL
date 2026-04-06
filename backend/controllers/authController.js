const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email ? email.trim() : '';
        const user = await User.findOne({ email: normalizedEmail });
        
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || 'secretkey',
                { expiresIn: '1d' }
            );
            res.json({ token, role: user.role, name: user.name });
        } else {
            res.status(401).json({ message: "Invalid Credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const user = await User.findOne({ email });
        
        if (user && await bcrypt.compare(currentPassword, user.password)) {
            const hash = await bcrypt.hash(newPassword, 10);
            await User.findByIdAndUpdate(user._id, { password: hash });
            res.json({ message: "Password updated successfully" });
        } else {
            res.status(401).json({ message: "Invalid Email or Current Password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { login, changePassword };

const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createUser = async (req, res) => {
    try {
        const { password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await User.create({ ...req.body, password: hash });
        res.json("User Created");
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        } else {
            delete req.body.password;
        }
        await User.findByIdAndUpdate(req.params.id, req.body);
        res.json("User Updated");
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json("User Deleted");
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };

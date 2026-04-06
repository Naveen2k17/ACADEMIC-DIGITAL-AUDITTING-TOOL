const Faculty = require('../models/Faculty');
const User = require('../models/User');

const getFaculty = async (req, res) => {
    try {
        const filter = {};
        if (req.query.department) filter.department = req.query.department;
        const faculty = await Faculty.find(filter);
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: "Error fetching faculty", error: error.message });
    }
};

const createFaculty = async (req, res) => {
    try {
        await Faculty.create(req.body);
        res.json("Saved");
    } catch (error) {
        res.status(500).json({ message: "Error creating faculty", error: error.message });
    }
};

const updateFaculty = async (req, res) => {
    try {
        await Faculty.findByIdAndUpdate(req.params.id, req.body);
        res.json("Faculty Updated");
    } catch (error) {
        res.status(500).json({ message: "Error updating faculty", error: error.message });
    }
};

const deleteFaculty = async (req, res) => {
    try {
        await Faculty.findByIdAndDelete(req.params.id);
        res.json("Faculty Deleted");
    } catch (error) {
        res.status(500).json({ message: "Error deleting faculty", error: error.message });
    }
};

const getFacultyUsers = async (req, res) => {
    try {
        const faculty = await User.find({ role: "Faculty" }, "name email");
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: "Error fetching faculty users", error: error.message });
    }
}

module.exports = { getFaculty, createFaculty, updateFaculty, deleteFaculty, getFacultyUsers };

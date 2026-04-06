const Student = require('../models/Student');
const User = require('../models/User');

const getStudents = async (req, res) => {
    try {
        const filter = {};
        if (req.query.department) filter.department = req.query.department;
        if (req.query.year) filter.year = req.query.year;

        if (req.user.role === "Student") {
            const user = await User.findById(req.user.id);
            const student = await Student.findOne({ name: user.name });
            return res.json({ data: student ? [student] : [], total: student ? 1 : 0, page: 1, pages: 1 });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalItems = await Student.countDocuments(filter);
        const students = await Student.find(filter).skip(skip).limit(limit);

        res.json({
            data: students,
            total: totalItems,
            page,
            pages: Math.ceil(totalItems / limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};

const createStudent = async (req, res) => {
    try {
        await Student.create(req.body);
        res.json("Saved");
    } catch (error) {
        res.status(500).json({ message: "Error creating student", error: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, req.body);
        res.json("Student Updated");
    } catch (error) {
        res.status(500).json({ message: "Error updating student", error: error.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json("Student Deleted");
    } catch (error) {
        res.status(500).json({ message: "Error deleting student", error: error.message });
    }
};

const markAttendance = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.body.studentId, { attendance: req.body.attendance });
        res.json("Updated");
    } catch (error) {
        res.status(500).json({ message: "Error marking attendance", error: error.message });
    }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent, markAttendance };

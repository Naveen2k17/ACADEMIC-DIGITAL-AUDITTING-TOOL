const Course = require('../models/Course');
const Infrastructure = require('../models/Infrastructure');

// --- Course Methods ---
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        await Course.create(req.body);
        res.json("Saved");
    } catch (error) {
        res.status(500).json({ message: "Error creating course", error: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        await Course.findByIdAndUpdate(req.params.id, req.body);
        res.json("Course Updated");
    } catch (error) {
        res.status(500).json({ message: "Error updating course", error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json("Course Deleted");
    } catch (error) {
        res.status(500).json({ message: "Error deleting course", error: error.message });
    }
};

// --- Infrastructure Methods ---
const getInfra = async (req, res) => {
    try {
        const infra = await Infrastructure.find();
        res.json(infra);
    } catch (error) {
        res.status(500).json({ message: "Error fetching infrastructure", error: error.message });
    }
};

const createInfra = async (req, res) => {
    try {
        await Infrastructure.create(req.body);
        res.json("Saved");
    } catch (error) {
        res.status(500).json({ message: "Error creating infrastructure", error: error.message });
    }
};

const updateInfra = async (req, res) => {
    try {
        await Infrastructure.findByIdAndUpdate(req.params.id, req.body);
        res.json("Infrastructure Updated");
    } catch (error) {
        res.status(500).json({ message: "Error updating infrastructure", error: error.message });
    }
};

const deleteInfra = async (req, res) => {
    try {
        await Infrastructure.findByIdAndDelete(req.params.id);
        res.json("Infrastructure Deleted");
    } catch (error) {
        res.status(500).json({ message: "Error deleting infrastructure", error: error.message });
    }
};

module.exports = {
    getCourses, createCourse, updateCourse, deleteCourse,
    getInfra, createInfra, updateInfra, deleteInfra
};

const AuditRule = require('../models/AuditRule');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Infrastructure = require('../models/Infrastructure');

// --- Audit Rule Engine ---
const getAuditRules = async (req, res) => {
    try {
        const rules = await AuditRule.find().sort({ createdAt: -1 });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: "Error fetching audit rules", error: error.message });
    }
};

const createAuditRule = async (req, res) => {
    try {
        await AuditRule.create(req.body);
        res.json("Rule Created");
    } catch (error) {
        res.status(500).json({ message: "Error creating audit rule", error: error.message });
    }
};

const updateAuditRule = async (req, res) => {
    try {
        await AuditRule.findByIdAndUpdate(req.params.id, req.body);
        res.json("Rule Updated");
    } catch (error) {
        res.status(500).json({ message: "Error updating audit rule", error: error.message });
    }
};

const deleteAuditRule = async (req, res) => {
    try {
        await AuditRule.findByIdAndDelete(req.params.id);
        res.json("Rule Deleted");
    } catch (error) {
        res.status(500).json({ message: "Error deleting audit rule", error: error.message });
    }
};

// --- Compliance Check ---
const getCompliance = async (req, res) => {
    try {
        const rules = await AuditRule.find({ type: "attendance" });
        const threshold = rules.length > 0 ? rules[0].threshold : 75;
        const lowAttendance = await Student.find({ attendance: { $lt: threshold } });
        res.json({ threshold, defaulters: lowAttendance });
    } catch (error) {
        res.status(500).json({ message: "Error fetching compliance", error: error.message });
    }
};

// --- Full Report ---
const getReports = async (req, res) => {
    try {
        const rules = await AuditRule.find();
        const attendanceRule = rules.find(r => r.type === "attendance");
        const creditsRule = rules.find(r => r.type === "credits");
        const attThreshold = attendanceRule ? attendanceRule.threshold : 75;
        const creditsThreshold = creditsRule ? creditsRule.threshold : 120;

        const students = await Student.find();
        const faculty = await Faculty.find();
        const courses = await Course.find();
        const infra = await Infrastructure.find();

        const attDefaulters = students.filter(s => s.attendance < attThreshold);
        const creditsDefaulters = students.filter(s => s.credits < creditsThreshold);

        res.json({
            summary: {
                totalStudents: students.length,
                totalFaculty: faculty.length,
                totalCourses: courses.length,
                totalInfra: infra.length,
                attDefaulters: attDefaulters.length,
                creditsDefaulters: creditsDefaulters.length,
                attThreshold,
                creditsThreshold
            },
            students,
            faculty,
            courses,
            infra,
            attDefaulters,
            creditsDefaulters
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating report", error: error.message });
    }
};

// --- Dashboard Stats ---
const getStats = async (req, res) => {
    try {
        res.json({
            facultyCount: await Faculty.countDocuments(),
            studentCount: await Student.countDocuments(),
            courseCount: await Course.countDocuments(),
            infraCount: await Infrastructure.countDocuments()
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats", error: error.message });
    }
};

module.exports = {
    getAuditRules, createAuditRule, updateAuditRule, deleteAuditRule,
    getCompliance, getReports, getStats
};

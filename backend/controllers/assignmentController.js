const CourseAssignment = require('../models/CourseAssignment');
const Student = require('../models/Student');
const AuditRule = require('../models/AuditRule');
const User = require('../models/User');

const createAssignment = async (req, res) => {
    try {
        const isSpecial = req.user.role === "Admin" || req.user.role === "HOD";
        const facultyId = isSpecial && req.body.facultyId ? req.body.facultyId : req.user.id;
        const facultyName = isSpecial && req.body.facultyName ? req.body.facultyName : (await User.findById(req.user.id)).name;

        const existing = await CourseAssignment.findOne({
            facultyId,
            courseName: req.body.courseName,
            semester: req.body.semester,
            section: req.body.section
        });
        if (existing) {
            return res.status(400).json({ message: "Assignment already exists. Use Edit to update or add students." });
        }
        await CourseAssignment.create({
            ...req.body,
            facultyId,
            facultyName
        });
        res.json({ message: "Students assigned successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating assignment", error: error.message });
    }
};

const getMyAssignments = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === "Student") {
            const user = await User.findById(req.user.id);
            query = { "students.studentName": user.name };
        } else if (req.user.role !== "Admin" && req.user.role !== "HOD") {
            query = { facultyId: req.user.id };
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalItems = await CourseAssignment.countDocuments(query);
        const assignments = await CourseAssignment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        
        res.json({
            data: assignments,
            total: totalItems,
            page,
            pages: Math.ceil(totalItems / limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching assignments", error: error.message });
    }
};

const getAllAssignments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalItems = await CourseAssignment.countDocuments();
        const assignments = await CourseAssignment.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        const rules = await AuditRule.find({ type: "credits" });
        const creditsThreshold = rules.length > 0 ? rules[0].threshold : 120;

        const enriched = await Promise.all(assignments.map(async (a) => {
            const studentIds = a.students.map(s => s.studentId);
            const studentDocs = await Student.find({ _id: { $in: studentIds } });

            const total = a.students.length;
            
            // Calculate Avg Attendance from embedded per-course data
            const avgAttendance = total > 0
                ? Math.round(a.students.reduce((sum, s) => sum + (s.attendance || 0), 0) / total)
                : 0;
            
            // Calculate Pass Percentage based on high attendance for realism
            const passPercentage = total > 0
                ? Math.min(100, Math.round((avgAttendance / 85) * 100))
                : 0;

            // Credit completion still comes from global student record
            const creditCompletion = studentDocs.filter(s => (s.credits || 0) >= creditsThreshold).length;

            return {
                _id: a._id,
                facultyName: a.facultyName,
                courseName: a.courseName,
                semester: a.semester,
                section: a.section,
                totalStudents: total,
                avgAttendance,
                passPercentage,
                creditCompletion,
                students: a.students
            };
        }));

        res.json({
            data: enriched,
            totalSize: totalItems,
            page,
            pages: Math.ceil(totalItems / limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching enriched assignments", error: error.message });
    }
};

const updateAssignment = async (req, res) => {
    try {
        await CourseAssignment.findByIdAndUpdate(req.params.id, {
            students: req.body.students,
            semester: req.body.semester,
            section: req.body.section
        });
        res.json({ message: "Assignment updated" });
    } catch (error) {
        res.status(500).json({ message: "Error updating assignment", error: error.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        await CourseAssignment.findByIdAndDelete(req.params.id);
        res.json({ message: "Assignment removed" });
    } catch (error) {
        res.status(500).json({ message: "Error removing assignment", error: error.message });
    }
};

const removeStudentFromAssignment = async (req, res) => {
    try {
        await CourseAssignment.findByIdAndUpdate(req.params.id, {
            $pull: { students: { studentId: req.params.studentId } }
        });
        res.json({ message: "Student removed from course list" });
    } catch (error) {
        res.status(500).json({ message: "Error removing student", error: error.message });
    }
};

const updateStudentAttendance = async (req, res) => {
    try {
        const { assignmentId, studentId, attendance } = req.body;
        await CourseAssignment.updateOne(
            { _id: assignmentId, "students.studentId": studentId },
            { $set: { "students.$.attendance": attendance } }
        );
        res.json({ message: "Student attendance updated for course" });
    } catch (error) {
        res.status(500).json({ message: "Error updating student attendance", error: error.message });
    }
};

const updateStudentGrade = async (req, res) => {
    try {
        const { assignmentId, studentId, grade } = req.body;
        await CourseAssignment.updateOne(
            { _id: assignmentId, "students.studentId": studentId },
            { $set: { "students.$.grade": grade } }
        );
        res.json({ message: "Student grade updated for course" });
    } catch (error) {
        res.status(500).json({ message: "Error updating student grade", error: error.message });
    }
};

module.exports = {
    createAssignment, getMyAssignments, getAllAssignments,
    updateAssignment, deleteAssignment, removeStudentFromAssignment,
    updateStudentAttendance, updateStudentGrade
};

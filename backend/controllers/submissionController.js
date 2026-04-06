const PublicationApproval = require('../models/PublicationApproval');
const SyllabusApproval = require('../models/SyllabusApproval');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');

// --- Publication Approvals ---
const submitPublication = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        await PublicationApproval.create({
            ...req.body,
            facultyId: req.user.id,
            facultyName: user.name,
            status: "Pending"
        });
        res.json({ message: "Publication submitted for HOD approval" });
    } catch (error) {
        res.status(500).json({ message: "Error submitting publication", error: error.message });
    }
};

const getMyPublications = async (req, res) => {
    try {
        const pubs = await PublicationApproval.find({ facultyId: req.user.id }).sort({ submittedAt: -1 });
        res.json(pubs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching publications", error: error.message });
    }
};

const getAllPublications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [pubs, total] = await Promise.all([
            PublicationApproval.find().sort({ submittedAt: -1 }).skip(skip).limit(limit),
            PublicationApproval.countDocuments()
        ]);

        res.json({
            data: pubs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all publications", error: error.message });
    }
};

const reviewPublication = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        await PublicationApproval.findByIdAndUpdate(req.params.id, {
            status,
            remarks: remarks || "",
            reviewedAt: new Date()
        });
        res.json({ message: `Publication ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Error reviewing publication", error: error.message });
    }
};

// --- Syllabus Approvals ---
const submitSyllabus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        await SyllabusApproval.create({
            ...req.body,
            submittedBy: user.name,
            submittedById: req.user.id,
            status: "Pending"
        });
        res.json({ message: "Syllabus submitted for HOD approval" });
    } catch (error) {
        res.status(500).json({ message: "Error submitting syllabus", error: error.message });
    }
};

const getMySyllabus = async (req, res) => {
    try {
        const list = await SyllabusApproval.find({ submittedById: req.user.id }).sort({ submittedAt: -1 });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: "Error fetching syllabi", error: error.message });
    }
};

const getAllSyllabus = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [list, total] = await Promise.all([
            SyllabusApproval.find().sort({ submittedAt: -1 }).skip(skip).limit(limit),
            SyllabusApproval.countDocuments()
        ]);

        res.json({
            data: list,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all syllabi", error: error.message });
    }
};

const reviewSyllabus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const syl = await SyllabusApproval.findById(req.params.id);
        const faculty = await User.findById(syl.submittedById);

        await SyllabusApproval.findByIdAndUpdate(req.params.id, {
            status,
            remarks: remarks || "",
            reviewedAt: new Date()
        });

        // Trigger Notification
        if (faculty && faculty.email) {
            const subject = `Update: Your Syllabus Review Status - ${status}`;
            const html = `
                <h3>Hello ${faculty.name},</h3>
                <p>Your syllabus submission for <b>"${syl.courseName}"</b> has been reviewed by the HOD.</p>
                <p><b>Status:</b> <span style="color: ${status === "Approved" ? "green" : "red"}">${status}</span></p>
                <p><b>Remarks:</b> ${remarks || "No additional remarks"}</p>
                <br/>
                <p>Best Regards,<br/>Academic Audit Support Tool</p>
            `;
            await sendEmail(faculty.email, subject, html);
        }

        res.json({ message: `Syllabus ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Error reviewing syllabus", error: error.message });
    }
};

module.exports = {
    submitPublication, getMyPublications, getAllPublications, reviewPublication,
    submitSyllabus, getMySyllabus, getAllSyllabus, reviewSyllabus
};

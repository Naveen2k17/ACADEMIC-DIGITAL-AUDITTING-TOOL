const Complaint = require('../models/Complaint');

const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: "Error fetching complaints", error: error.message });
    }
};

const createComplaint = async (req, res) => {
    try {
        await Complaint.create({ ...req.body, raisedBy: req.user.id });
        res.json("Complaint Logged");
    } catch (error) {
        res.status(500).json({ message: "Error creating complaint", error: error.message });
    }
};

const updateComplaint = async (req, res) => {
    try {
        await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.json("Complaint Updated");
    } catch (error) {
        res.status(500).json({ message: "Error updating complaint", error: error.message });
    }
};

module.exports = { getComplaints, createComplaint, updateComplaint };

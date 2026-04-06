const Infrastructure = require('../models/Infrastructure');

exports.getAllInfra = async (req, res) => {
    try {
        const infraList = await Infrastructure.find();
        res.status(200).json(infraList);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.addInfra = async (req, res) => {
    try {
        const newInfra = new Infrastructure(req.body);
        await newInfra.save();
        res.status(201).json(newInfra);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.updateInfra = async (req, res) => {
    try {
        const updated = await Infrastructure.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.deleteInfra = async (req, res) => {
    try {
        await Infrastructure.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

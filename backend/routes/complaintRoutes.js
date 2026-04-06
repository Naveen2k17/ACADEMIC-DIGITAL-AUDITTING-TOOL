const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaint } = require('../controllers/complaintController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id', updateComplaint);

module.exports = router;

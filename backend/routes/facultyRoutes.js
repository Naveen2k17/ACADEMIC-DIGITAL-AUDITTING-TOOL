const express = require('express');
const router = express.Router();
const { getFaculty, createFaculty, updateFaculty, deleteFaculty, getFacultyUsers } = require('../controllers/facultyController');
const { markAttendance } = require('../controllers/studentController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getFaculty);
router.post('/', createFaculty);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);
router.get('/users', getFacultyUsers);
router.post('/mark-attendance', markAttendance);

module.exports = router;

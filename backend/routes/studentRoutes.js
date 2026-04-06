const express = require('express');
const router = express.Router();
const { getStudents, createStudent, updateStudent, deleteStudent, markAttendance } = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { student: studentSchema } = require('../validations/schemas');

router.use(verifyToken);

router.get('/', getStudents);
router.post('/', validate(studentSchema), createStudent);
router.put('/:id', validate(studentSchema), updateStudent);
router.delete('/:id', deleteStudent);
router.post('/mark-attendance', markAttendance);

module.exports = router;

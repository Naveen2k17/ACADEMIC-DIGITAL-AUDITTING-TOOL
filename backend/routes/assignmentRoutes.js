const express = require('express');
const router = express.Router();
const { 
  createAssignment, getMyAssignments, getAllAssignments, 
  updateAssignment, deleteAssignment, removeStudentFromAssignment,
  updateStudentAttendance, updateStudentGrade 
} = require('../controllers/assignmentController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { courseAssignment: assignmentSchema } = require('../validations/schemas');

router.use(verifyToken);

router.post('/', validate(assignmentSchema), createAssignment);
router.get('/my', getMyAssignments);
router.get('/all', getAllAssignments);
router.put('/mark-attendance', updateStudentAttendance);
router.put('/mark-grade', updateStudentGrade);

router.put('/:id', validate(assignmentSchema), updateAssignment);
router.delete('/:id', deleteAssignment);
router.delete('/:id/student/:studentId', removeStudentFromAssignment);

module.exports = router;

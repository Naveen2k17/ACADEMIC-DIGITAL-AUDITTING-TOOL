const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse, getInfra, createInfra, updateInfra, deleteInfra } = require('../controllers/courseController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Courses
router.get('/', getCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Infrastructure
router.get('/infra', getInfra);
router.post('/infra', createInfra);
router.put('/infra/:id', updateInfra);
router.delete('/infra/:id', deleteInfra);

module.exports = router;

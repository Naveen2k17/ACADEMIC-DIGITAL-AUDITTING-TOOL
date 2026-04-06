const express = require('express');
const router = express.Router();
const { submitPublication, getMyPublications, getAllPublications, reviewPublication,
    submitSyllabus, getMySyllabus, getAllSyllabus, reviewSyllabus } = require('../controllers/submissionController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Publications
router.post('/publications/submit', submitPublication);
router.get('/publications/my', getMyPublications);
router.get('/publications/all', getAllPublications);
router.put('/publications/review/:id', reviewPublication);

// Syllabus
router.post('/syllabus/submit', submitSyllabus);
router.get('/syllabus/my', getMySyllabus);
router.get('/syllabus/all', getAllSyllabus);
router.put('/syllabus/review/:id', reviewSyllabus);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { getFacultyUsers } = require('../controllers/facultyController');
const { verifyToken, authorize } = require('../middleware/auth');

router.use(verifyToken);
router.use(authorize(['Admin', 'HOD']));

router.post('/create-user', createUser);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/faculty', getFacultyUsers);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAllInfra, addInfra, updateInfra, deleteInfra } = require('../controllers/infraController');
const validate = require('../middleware/validate');
const { infrastructure: infraSchema } = require('../validations/schemas');

router.get('/', getAllInfra);
router.post('/', validate(infraSchema), addInfra);
router.put('/:id', validate(infraSchema), updateInfra);
router.delete('/:id', deleteInfra);

module.exports = router;

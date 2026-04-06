const express = require('express');
const router = express.Router();
const { getAuditRules, createAuditRule, updateAuditRule, deleteAuditRule, getCompliance, getReports, getStats } = require('../controllers/auditController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/audit-rules', getAuditRules);
router.post('/audit-rules', createAuditRule);
router.put('/audit-rules/:id', updateAuditRule);
router.delete('/audit-rules/:id', deleteAuditRule);

router.get('/compliance', getCompliance);
router.get('/reports', getReports);
router.get('/stats', getStats);

module.exports = router;

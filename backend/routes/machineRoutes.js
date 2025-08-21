const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  reportHealthData,
  getMachines,
  getMachineHistory,
  exportToCSV,
} = require('../controllers/machineController');

router.post(
  '/report',
  [
    body('machineId').notEmpty().withMessage('Machine ID is required'),
  ],
  reportHealthData
);
router.get('/machines', getMachines);
router.get('/machines/:id/history', getMachineHistory);
router.get('/export/csv', exportToCSV);

module.exports = router;
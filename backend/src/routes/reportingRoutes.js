const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', reportingController.getSummaryReport);

module.exports = router;
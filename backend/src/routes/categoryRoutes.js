const express = require('express');
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middlewares/authMiddleware');
const { validateCategory } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.use(verifyToken);

router.post('/', validateCategory, categoryController.createCategory);
router.get('/', categoryController.getCategories);

module.exports = router;
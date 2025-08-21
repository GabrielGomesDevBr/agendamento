const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// POST /api/auth/login
router.post('/login', validate(schemas.login), authController.login);

// GET /api/auth/verify
router.get('/verify', authenticateToken, authController.verifyToken);

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
const express = require('express');
const { register, login } = require('../controllers/authController');
const { updateUserRole } = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);  // aquí usamos login

router.put('/role/:userId', verifyToken, isAdmin, updateUserRole);

module.exports = router;

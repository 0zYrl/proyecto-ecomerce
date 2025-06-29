const express = require('express');
const { updateUserRole } = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

// Solo un admin puede cambiar roles
router.put('/role/:userId', verifyToken, isAdmin, updateUserRole);

module.exports = router;

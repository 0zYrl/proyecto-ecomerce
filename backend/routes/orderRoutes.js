const express = require('express');
const { createOrderFromCart, getUserOrders, getAllOrders } = require('../controllers/orderController');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.post('/checkout', verifyToken, createOrderFromCart);
router.get('/', verifyToken, getUserOrders);
router.get('/admin/all', verifyToken, isAdmin, getAllOrders);

module.exports = router;

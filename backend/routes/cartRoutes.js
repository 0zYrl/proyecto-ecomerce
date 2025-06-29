const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require('../controllers/cartController');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getCart);
router.post('/add', verifyToken, addToCart); // 👈 ESTA RUTA
router.put('/update', verifyToken, updateCartItem);
router.delete('/remove/:itemId', verifyToken, removeFromCart);

module.exports = router;

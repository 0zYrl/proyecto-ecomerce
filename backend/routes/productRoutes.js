const express = require('express');
const {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

// Público
router.get('/', getAllProducts);

// Protegidas
router.post('/', verifyToken, isAdmin, addProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;

const { pool } = require('../models/productModel');

// Obtener todos los productos (público)
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Agregar producto (admin)
const addProduct = async (req, res) => {
  const { name, description, price, image, category, stock } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, image, category, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, image, category, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// Editar producto (admin)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category, stock } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, image=$4, category=$5, stock=$6
       WHERE id=$7 RETURNING *`,
      [name, description, price, image, category, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Eliminar producto (admin)
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};

const { pool } = require('../models/cartModel');

// Obtener carrito actual del usuario
const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    let cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);

    if (cart.rows.length === 0) {
      cart = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
        [userId]
      );
    }

    const cartId = cart.rows[0].id;

    const items = await pool.query(`
      SELECT cart_items.id, cart_items.quantity, products.name, products.price, products.image
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.cart_id = $1
    `, [cartId]);

    res.json(items.rows); // 👈 corregido para que el front reciba un array directo
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// Agregar producto al carrito
const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  console.log('🛒 Intentando agregar al carrito:', { userId, productId, quantity });

  try {
    // Obtener o crear carrito
    let cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);

    if (cart.rows.length === 0) {
      cart = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    }

    const cartId = cart.rows[0].id;

    // Verificar si ya existe ese producto en el carrito
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    if (existing.rows.length > 0) {
      // Si ya está, aumentar cantidad
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
        [quantity, existing.rows[0].id]
      );
    } else {
      // Si no está, insertarlo
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, productId, quantity]
      );
    }

    res.json({ mensaje: 'Producto agregado al carrito' });
    } catch (err) {
    console.error('❌ Error en addToCart:', err); // <--- este log
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

// Esto para actualizar cantidad de un producto
const updateCartItem = async (req, res) => {
  const { itemId, quantity } = req.body;

  try {
    await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2',
      [quantity, itemId]
    );
    res.json({ mensaje: 'Cantidad actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cantidad' });
  }
};

// Esto es para eliminar un producto del carrito
const removeFromCart = async (req, res) => {
  const { itemId } = req.params;

  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    res.json({ mensaje: 'Producto eliminado del carrito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};

const pool = require('../config/db');

const getOrCreateCart = async (userId) => {
  const existing = await pool.query(
    'SELECT id FROM carts WHERE user_id = $1 LIMIT 1',
    [userId]
  );

  if (existing.rows.length > 0) return existing.rows[0].id;

  const created = await pool.query(
    'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
    [userId]
  );

  return created.rows[0].id;
};

const addToCart = async (userId, productId, quantity = 1) => {
  const cartId = await getOrCreateCart(userId);

  const exists = await pool.query(
    'SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cartId, productId]
  );

  if (exists.rows.length > 0) {
    return pool.query(
      'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3',
      [quantity, cartId, productId]
    );
  } else {
    return pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
      [cartId, productId, quantity]
    );
  }
};

const getCartItems = async (userId) => {
  const res = await pool.query(`
    SELECT ci.id, ci.quantity, p.name, p.price, p.image
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN products p ON ci.product_id = p.id
    WHERE c.user_id = $1
  `, [userId]);

  return res.rows;
};

const clearCart = async (userId) => {
  const cart = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (cart.rows.length === 0) return;
  const cartId = cart.rows[0].id;

  return pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
};

const removeItem = async (userId, productId) => {
  const cart = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (cart.rows.length === 0) return;
  const cartId = cart.rows[0].id;

  return pool.query(
    'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cartId, productId]
  );
};

module.exports = {
  pool,
  getOrCreateCart,
  addToCart,
  getCartItems,
  clearCart,
  removeItem,
};
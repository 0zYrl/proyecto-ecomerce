const { pool } = require('../models/orderModel');

// Crear una orden desde el carrito
const createOrderFromCart = async (req, res) => {
  const userId = req.user.id;

  try {
    // Obtener carrito
    const cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (cart.rows.length === 0) return res.status(400).json({ error: 'Carrito vacío' });

    const cartId = cart.rows[0].id;

    // Obtener items del carrito con precio
    const items = await pool.query(`
      SELECT ci.product_id, ci.quantity, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    if (items.rows.length === 0) return res.status(400).json({ error: 'No hay productos en el carrito' });

    // Calcular total
    let total = 0;
    items.rows.forEach(item => {
      total += parseFloat(item.price) * item.quantity;
    });

    // Crear la orden
    const order = await pool.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
      [userId, total]
    );
    const orderId = order.rows[0].id;

    // Insertar cada ítem
    for (const item of items.rows) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Vaciar carrito
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    res.json({
      mensaje: 'Orden creada exitosamente',
      orden: order.rows[0]
    });

  } catch (err) {
    console.error('❌ Error en createOrderFromCart:', err);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
};

// Obtener todas las órdenes del usuario autenticado
const getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await pool.query(`
      SELECT o.id, o.total, o.created_at, json_agg(
        json_build_object(
          'name', p.name,
          'price', oi.price,
          'quantity', oi.quantity,
          'image', p.image
        )
      ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

    res.json(orders.rows);
  } catch (err) {
    console.error('❌ Error en getUserOrders:', err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// Obtener todas las órdenes (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT o.id, o.total, o.created_at, u.name AS user_name, u.email, json_agg(
        json_build_object(
          'name', p.name,
          'price', oi.price,
          'quantity', oi.quantity,
          'image', p.image
        )
      ) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);

    res.json(orders.rows);
  } catch (err) {
    console.error('❌ Error en getAllOrders:', err);
    res.status(500).json({ error: 'Error al obtener todas las órdenes' });
  }
};

module.exports = {
  createOrderFromCart,
  getUserOrders,
  getAllOrders,
};

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const pool = require('../config/db');

// 🆕 Crear nueva orden con control de stock
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  const { items } = req.body; // items = [{ productId, quantity }]

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No se enviaron productos válidos.' });
  }

  try {
    await client.query('BEGIN');

    // Verificar stock
    for (const item of items) {
      const result = await client.query(
        'SELECT stock FROM products WHERE id = $1',
        [item.productId]
      );
      if (result.rows.length === 0) throw new Error(`Producto ${item.productId} no existe`);
      if (result.rows[0].stock < item.quantity) {
        throw new Error(`Stock insuficiente para producto ${item.productId}`);
      }
    }

    // Crear orden
    const orderRes = await client.query(
      'INSERT INTO orders (user_id) VALUES ($1) RETURNING id',
      [req.user.id]
    );
    const orderId = orderRes.rows[0].id;

    // Guardar cada item de la orden y actualizar stock
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [orderId, item.productId, item.quantity]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Orden creada correctamente', orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

// ✅ Ver órdenes del usuario autenticado
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus órdenes.' });
  }
});

// ✅ Ver todas las órdenes (solo admin)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT orders.*, users.email
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener todas las órdenes.' });
  }
});

router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pendiente', 'enviado', 'entregado'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json({ message: 'Estado actualizado', order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de la orden' });
  }
});

router.get('/metrics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Total ventas
    const totalSalesResult = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS total_sales FROM orders
    `);

    // Número de órdenes por estado
    const ordersByStatusResult = await pool.query(`
      SELECT status, COUNT(*) AS count FROM orders GROUP BY status
    `);

    // Productos más vendidos (sumando cantidades en order_items)
    const topProductsResult = await pool.query(`
      SELECT p.id, p.name, COALESCE(SUM(oi.quantity), 0) AS total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      totalSales: totalSalesResult.rows[0].total_sales,
      ordersByStatus: ordersByStatusResult.rows,
      topProducts: topProductsResult.rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener métricas' });
  }
});

module.exports = router;

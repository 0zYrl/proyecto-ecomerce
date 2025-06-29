const createOrderFromCart = async (req, res) => {
  const userId = req.user.id;

  try {
    // Obtener carrito
    const cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (cart.rows.length === 0) return res.status(400).json({ error: 'Carrito vacío' });

    const cartId = cart.rows[0].id;

    // Obtener items del carrito con precio y stock actual
    const items = await pool.query(`
      SELECT ci.product_id, ci.quantity, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    if (items.rows.length === 0) return res.status(400).json({ error: 'No hay productos en el carrito' });

    // Verificar stock
    for (const item of items.rows) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para el producto con ID ${item.product_id}`
        });
      }
    }

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

    // Insertar ítems y restar stock
    for (const item of items.rows) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
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

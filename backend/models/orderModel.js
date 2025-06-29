const { pool } = require('./userModel');

const createOrderTables = async () => {
  // Tabla de órdenes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      total NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Productos dentro de cada orden
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER,
      price NUMERIC(10, 2)
    );
  `);

  console.log('✅ Tablas "orders" y "order_items" listas.');
};

module.exports = { createOrderTables, pool };

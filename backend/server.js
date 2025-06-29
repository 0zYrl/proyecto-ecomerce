const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

const { createUsersTable } = require('./models/userModel');
const { createProductsTable } = require('./models/productModel');
const { createCartTables } = require('./models/cartModel');
const { createOrderTables } = require('./models/orderModel');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await createUsersTable();
    await createProductsTable();
    await createCartTables();
    await createOrderTables();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error creando tablas o iniciando servidor:', error);
  }
};

startServer();

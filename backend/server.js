const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');


dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

const { createUsersTable } = require('./models/userModel');
createUsersTable();

const { createProductsTable } = require('./models/productModel');
createProductsTable();

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const { createCartTables } = require('./models/cartModel');
//createCartTables();

const { createOrderTables } = require('./models/orderModel');
createOrderTables();


// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

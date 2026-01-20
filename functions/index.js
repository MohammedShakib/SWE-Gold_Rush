const { onRequest } = require('firebase-functions/v2/https');
const functions = require('firebase-functions');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const shopRoutes = require('./routes/shopRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

// Connect to Database
connectDB();

app.use(cors({ origin: true }));
app.use(express.json());

// Mount Routes
app.use('/gl/auth', authRoutes);
app.use('/gl/products', productRoutes);
app.use('/gl/shops', shopRoutes);
app.use('/gl/cart', cartRoutes);
app.use('/gl/orders', orderRoutes);
app.use('/gl/search', searchRoutes);

app.get('/', (req, res) => {
  res.send('Gold Marketplace API is running on Firebase Functions');
});

exports.api = onRequest(app);

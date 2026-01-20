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
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/gl/auth', authRoutes);
app.use('/api/gl/products', productRoutes);
app.use('/api/gl/shops', shopRoutes);
app.use('/api/gl/cart', cartRoutes);
app.use('/api/gl/orders', orderRoutes);
app.use('/api/gl/search', searchRoutes);

app.get('/', (req, res) => {
  res.send('Gold Marketplace API is running');
});

// Deprecated old route, pointing to new structure if needed, or keeping for compatibility
app.get('/api/products-legacy', (req, res) => {
  res.json([
    { id: 1, name: '22K Gold Ring', price: 50000, shop: 'Amin Jewellers' },
    { id: 2, name: '18K Diamond Necklace', price: 150000, shop: 'Diamond World' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

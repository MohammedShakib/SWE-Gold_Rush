import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ShopProfile from './pages/ShopProfile';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop/:id" element={<ShopProfile />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/wishlist" element={<UserProfile />} /> {/* Redirect to profile for now */}
          {/* Add more routes here later */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;

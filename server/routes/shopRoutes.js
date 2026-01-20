const express = require('express');
const router = express.Router();
const { sql } = require('../db');

// @desc    Get top rated shops
// @route   GET /api/gl/shops/top-rated
// @access  Public
router.get('/top-rated', async (req, res) => {
    try {
        // Fetch top rated shops based on GL_ShopProfiles rating
        const result = await sql.query`
            SELECT TOP 10 s.id, s.shop_name, sp.logo_url, sp.rating, sp.shop_slug 
            FROM shopowners s
            JOIN GL_ShopProfiles sp ON s.id = sp.shopowner_id
            ORDER BY sp.rating DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get shop details by slug
// @route   GET /api/gl/shops/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT s.id, s.shop_name, s.shop_address, s.phone, sp.* 
            FROM shopowners s
            JOIN GL_ShopProfiles sp ON s.id = sp.shopowner_id
            WHERE sp.shop_slug = ${req.params.slug}
        `;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get shop products
// @route   GET /api/gl/shops/:slug/products
// @access  Public
router.get('/:slug/products', async (req, res) => {
    try {
        // First get shopowner_id from slug
        const shopResult = await sql.query`SELECT shopowner_id FROM GL_ShopProfiles WHERE shop_slug = ${req.params.slug}`;
        if (shopResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        const shopId = shopResult.recordset[0].shopowner_id;

        const result = await sql.query`SELECT * FROM products WHERE shopowner_id = ${shopId}`;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get trending products
// @route   GET /api/gl/products/trending
// @access  Public
router.get('/trending', async (req, res) => {
    try {
        // For now, just getting top 10 random products or latest
        const result = await sql.query`SELECT TOP 10 * FROM products ORDER BY NEWID()`;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get product details
// @route   GET /api/gl/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM products WHERE id = ${req.params.id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get product reviews
// @route   GET /api/gl/products/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT r.*, u.full_name 
            FROM GL_Reviews r 
            JOIN GL_Users u ON r.user_id = u.id 
            WHERE r.product_id = ${req.params.id}
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create product review
// @route   POST /api/gl/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment, image_url } = req.body;
    try {
        await sql.query`
            INSERT INTO GL_Reviews (user_id, product_id, rating, comment, image_url)
            VALUES (${req.user.id}, ${req.params.id}, ${rating}, ${comment}, ${image_url})
        `;
        res.status(201).json({ message: 'Review added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

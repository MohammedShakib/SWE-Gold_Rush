const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user cart
// @route   GET /api/gl/cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const result = await sql.query`
            SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url, s.shop_name 
            FROM GL_Cart c
            JOIN products p ON c.product_id = p.id
            JOIN shopowners s ON p.shopowner_id = s.id
            WHERE c.user_id = ${req.user.id}
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Add item to cart
// @route   POST /api/gl/cart/add
// @access  Private
router.post('/add', protect, async (req, res) => {
    const { product_id, quantity } = req.body;
    try {
        // Check if item already exists in cart, then update quantity ?? Or just insert new row?
        // Let's check first
        const check = await sql.query`SELECT * FROM GL_Cart WHERE user_id = ${req.user.id} AND product_id = ${product_id}`;

        if (check.recordset.length > 0) {
            await sql.query`UPDATE GL_Cart SET quantity = quantity + ${quantity} WHERE user_id = ${req.user.id} AND product_id = ${product_id}`;
        } else {
            await sql.query`INSERT INTO GL_Cart (user_id, product_id, quantity) VALUES (${req.user.id}, ${product_id}, ${quantity})`;
        }

        res.status(200).json({ message: 'Item added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/gl/cart/:itemId
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
    try {
        await sql.query`DELETE FROM GL_Cart WHERE id = ${req.params.itemId} AND user_id = ${req.user.id}`;
        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

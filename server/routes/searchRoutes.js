const express = require('express');
const router = express.Router();
const { sql } = require('../db');

// @desc    Search products
// @route   GET /api/gl/search
// @access  Public
router.get('/', async (req, res) => {
    const query = req.query.q;
    try {
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const result = await sql.query`
            SELECT * FROM products 
            WHERE name LIKE ${'%' + query + '%'} 
            OR description LIKE ${'%' + query + '%'}
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

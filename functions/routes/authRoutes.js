const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/gl/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { full_name, phone, password, address } = req.body;

    if (!full_name || !phone || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        // Check if user exists
        const userCheck = await sql.query`SELECT * FROM GL_Users WHERE phone = ${phone}`;
        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await sql.query`
            INSERT INTO GL_Users (full_name, phone, password_hash, address)
            OUTPUT inserted.id, inserted.full_name, inserted.phone
            VALUES (${full_name}, ${phone}, ${hashedPassword}, ${address})
        `;

        const user = result.recordset[0];

        res.status(201).json({
            id: user.id,
            full_name: user.full_name,
            phone: user.phone,
            token: generateToken(user.id)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Authenticate a user
// @route   POST /api/gl/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Check for user email
        const result = await sql.query`SELECT * FROM GL_Users WHERE phone = ${phone}`;
        const user = result.recordset[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            res.json({
                id: user.id,
                full_name: user.full_name,
                phone: user.phone,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get user data
// @route   GET /api/gl/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const result = await sql.query`SELECT id, full_name, phone, address, created_at FROM GL_Users WHERE id = ${req.user.id}`;
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

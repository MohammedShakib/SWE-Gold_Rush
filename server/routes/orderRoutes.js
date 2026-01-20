const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const { protect } = require('../middleware/authMiddleware');

// @desc    Place new order
// @route   POST /api/gl/orders/place
// @access  Private
router.post('/place', protect, async (req, res) => {
    const { delivery_address } = req.body;

    try {
        // 1. Get cart items
        const cartItems = await sql.query`
            SELECT c.*, p.price, p.shopowner_id, p.making_charge 
            FROM GL_Cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ${req.user.id}
        `;

        if (cartItems.recordset.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Group by shopowner to create separate orders per shop
        const itemsByShop = cartItems.recordset.reduce((acc, item) => {
            if (!acc[item.shopowner_id]) acc[item.shopowner_id] = [];
            acc[item.shopowner_id].push(item);
            return acc;
        }, {});

        // Start transaction (simplified logic here, ideally use SQL transaction)

        for (const shopId in itemsByShop) {
            const items = itemsByShop[shopId];
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity) + (item.making_charge || 0), 0);
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Create Order
            const orderResult = await sql.query`
                INSERT INTO GL_Orders (order_number, user_id, shopowner_id, total_amount, payment_status, order_status, delivery_address)
                OUTPUT inserted.id
                VALUES (${orderNumber}, ${req.user.id}, ${shopId}, ${totalAmount}, 'Pending', 'Pending', ${delivery_address})
            `;
            const orderId = orderResult.recordset[0].id;

            // Create Order Items
            for (const item of items) {
                await sql.query`
                    INSERT INTO GL_OrderItems (order_id, product_id, quantity, price_at_purchase, making_charge)
                    VALUES (${orderId}, ${item.product_id}, ${item.quantity}, ${item.price}, ${item.making_charge || 0})
                `;
            }
        }

        // Clear Cart
        await sql.query`DELETE FROM GL_Cart WHERE user_id = ${req.user.id}`;

        res.status(201).json({ message: 'Order placed successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get order history
// @route   GET /api/gl/orders/history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM GL_Orders WHERE user_id = ${req.user.id} ORDER BY created_at DESC`;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get order details
// @route   GET /api/gl/orders/:orderId
// @access  Private
router.get('/:orderId', protect, async (req, res) => {
    try {
        // Check if order belongs to user
        const orderCheck = await sql.query`SELECT * FROM GL_Orders WHERE id = ${req.params.orderId} AND user_id = ${req.user.id}`;
        if (orderCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const itemsResult = await sql.query`
            SELECT oi.*, p.name, p.image_url 
            FROM GL_OrderItems oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ${req.params.orderId}
        `;

        const order = orderCheck.recordset[0];
        order.items = itemsResult.recordset;

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

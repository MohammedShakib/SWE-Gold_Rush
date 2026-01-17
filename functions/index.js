const { onRequest } = require("firebase-functions/v2/https");
const express = require('express');
const cors = require('cors');
const { sql, connectDB } = require('./db');
const SSLCommerzPayment = require('sslcommerz-lts');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Connect to Database
connectDB().then(async () => {
    try {
        const pool = await sql.connect();

        // 1. Schema Initialization (Tables + Branch Column)
        const tables = [
            'products', 'sales', 'manufacturing_orders', 'repair_tickets',
            'customers', 'users', 'installments'
        ];

        for (const table of tables) {
            // Check if 'branch' column exists, if not add it
            const checkColumnQuery = `
                IF COL_LENGTH('${table}', 'branch') IS NULL
                ALTER TABLE ${table} ADD branch NVARCHAR(255) DEFAULT 'Main Branch';
            `;
            await pool.request().query(checkColumnQuery);
        }

        const createManufacturingTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='manufacturing_orders' AND xtype='U')
            CREATE TABLE manufacturing_orders (
                id INT IDENTITY(1,1) PRIMARY KEY,
                order_id NVARCHAR(50) NOT NULL,
                customer_name NVARCHAR(255) NOT NULL,
                product_name NVARCHAR(255) NOT NULL,
                karigar_name NVARCHAR(255) NULL,
                status NVARCHAR(50) NOT NULL,
                gold_weight FLOAT NULL,
                due_date DATETIME NULL,
                branch NVARCHAR(255) DEFAULT 'Main Branch',
                created_at DATETIME DEFAULT GETDATE()
            );
        `;
        await pool.request().query(createManufacturingTableQuery);

        console.log("Database schema synchronized (branch columns added).");

        // 2. Demo Data Generation
        const checkDemoQuery = "SELECT COUNT(*) as count FROM products WHERE branch = 'Chittagong Branch'";
        const demoResult = await pool.request().query(checkDemoQuery);

        if (demoResult.recordset[0].count === 0) {
            console.log("Seeding demo data for Chittagong Branch...");
            // Demo Products
            await pool.request().query(`
                INSERT INTO products (name, category, karat, weight, price, stock_quantity, image_url, branch, status)
                VALUES 
                ('Chittagong Gold Necklace', 'Necklace', '22K', 12.5, 120000, 5, 'https://placehold.co/400', 'Chittagong Branch', 'In Stock'),
                ('Agrabad Special Ring', 'Ring', '21K', 5.0, 45000, 10, 'https://placehold.co/400', 'Chittagong Branch', 'In Stock');
            `);
            // Demo Repairs
            await pool.request().query(`
                INSERT INTO repair_tickets (ticket_id, customer_name, customer_phone, item_name, issue_description, estimated_cost, branch, status)
                VALUES 
                ('REP-CTG-001', 'Karim Ullah', '01812345678', 'Broken Chain', 'Soldering needed', 500, 'Chittagong Branch', 'Active');
            `);
            // Demo Sales
            await pool.request().query(`
                INSERT INTO sales (total_amount, tax_amount, final_amount, payment_method, transaction_id, status, branch)
                VALUES 
                (120000, 6000, 126000, 'Cash', 'TXN-CTG-101', 'Completed', 'Chittagong Branch');
            `);
        }

    } catch (err) {
        console.error("Schema initialization failed:", err);
    }
});

// GET /api/inventory
app.get('/api/inventory', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('branch', sql.NVarChar, branch)
            .query('SELECT * FROM products WHERE branch = @branch ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/inventory
app.post('/api/inventory', async (req, res) => {
    const { name, category, karat, weight, price, stock_quantity, image_url, supplier_id, product_code, branch } = req.body;
    // Validation
    if (!name || !price) {
        return res.status(400).json({ error: "Name and Price are required" });
    }
    try {
        const pool = await sql.connect();
        const insertQuery = `
            INSERT INTO products (name, category, karat, weight, price, stock_quantity, image_url, supplier_id, product_code, branch)
            OUTPUT INSERTED.*
            VALUES (@name, @category, @karat, @weight, @price, @stock_quantity, @image_url, @supplier_id, @product_code, @branch)
        `;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('category', sql.NVarChar, category || null)
            .input('karat', sql.NVarChar, karat || null)
            .input('weight', sql.Decimal(10, 2), weight || 0)
            .input('price', sql.Decimal(18, 2), price)
            .input('stock_quantity', sql.Int, stock_quantity || 0)
            .input('image_url', sql.NVarChar, image_url || null)
            .input('supplier_id', sql.Int, supplier_id || null)
            .input('product_code', sql.NVarChar, product_code || `P-${Date.now()}`)
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .query(insertQuery);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/inventory/:id
app.put('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, karat, weight, price, stock_quantity, image_url, status } = req.body;
    try {
        const pool = await sql.connect();
        const updateQuery = `
            UPDATE products
            SET name = @name, category = @category, karat = @karat, weight = @weight, price = @price, stock_quantity = @stock_quantity, image_url = @image_url, status = @status
            OUTPUT INSERTED.*
            WHERE id = @id
        `;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('category', sql.NVarChar, category || null)
            .input('karat', sql.NVarChar, karat || null)
            .input('weight', sql.Decimal(10, 2), weight || 0)
            .input('price', sql.Decimal(18, 2), price)
            .input('stock_quantity', sql.Int, stock_quantity || 0)
            .input('image_url', sql.NVarChar, image_url || null)
            .input('status', sql.NVarChar, status || 'In Stock')
            .query(updateQuery);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/inventory/:id
app.delete('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM products WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/repairs
app.get('/api/repairs', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('branch', sql.NVarChar, branch)
            .query('SELECT * FROM repair_tickets WHERE branch = @branch ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching repair tickets:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/repairs
app.post('/api/repairs', async (req, res) => {
    const { customer_name, customer_phone, item_name, issue_description, estimated_cost, due_date, branch } = req.body;
    try {
        const ticket_id = `REP-${Date.now()}`;
        const pool = await sql.connect();
        await pool.request()
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .input('ticket_id', sql.NVarChar, ticket_id)
            .input('customer_name', sql.NVarChar, customer_name)
            .input('customer_phone', sql.NVarChar, customer_phone || null)
            .input('item_name', sql.NVarChar, item_name)
            .input('issue_description', sql.NVarChar, issue_description)
            .input('estimated_cost', sql.Decimal(18, 2), estimated_cost || 0)
            .input('due_date', sql.DateTime, due_date || null)
            .query(`
                INSERT INTO repair_tickets (ticket_id, customer_name, customer_phone, item_name, issue_description, estimated_cost, due_date, branch, status)
                OUTPUT INSERTED.*
                VALUES (@ticket_id, @customer_name, @customer_phone, @item_name, @issue_description, @estimated_cost, @due_date, @branch, 'Active')
            `);
        res.status(201).json({ message: "Repair ticket created" });
    } catch (err) {
        console.error("Error creating repair ticket:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/repairs/:id (For status update etc)
app.put('/api/repairs/:id', async (req, res) => {
    const { id } = req.params;
    const { status, estimated_cost, delivery_date } = req.body;
    try {
        const pool = await sql.connect();
        let query = 'UPDATE repair_tickets SET ';
        const updates = [];
        if (status) updates.push("status = @status");
        if (estimated_cost) updates.push("estimated_cost = @estimated_cost");
        if (delivery_date) updates.push("delivery_date = @delivery_date");
        if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });

        query += updates.join(", ");
        query += " OUTPUT INSERTED.* WHERE id = @id";
        const request = pool.request().input('id', sql.Int, id);
        if (status) request.input('status', sql.NVarChar, status);
        if (estimated_cost) request.input('estimated_cost', sql.Decimal(18, 2), estimated_cost);
        if (delivery_date) request.input('delivery_date', sql.DateTime, delivery_date);

        const result = await request.query(query);
        if (result.recordset.length === 0) return res.status(404).json({ error: "Ticket not found" });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error updating repair ticket:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/sales
app.get('/api/sales', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('branch', sql.NVarChar, branch)
            .query('SELECT * FROM sales WHERE branch = @branch ORDER BY sale_date DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching sales:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/payment/init
app.post('/api/payment/init', async (req, res) => {
    const { cart, paymentMethod, branch } = req.body;
    if (!cart || cart.length === 0) return res.status(400).json({ error: "Cart is empty" });

    try {
        const total_amount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const tax_amount = total_amount * 0.05;
        const final_amount = total_amount + tax_amount;
        const tran_id = uuidv4();
        const pool = await sql.connect();

        const isCash = paymentMethod === 'Cash';
        const saleStatus = isCash ? 'Completed' : 'Pending';
        const method = isCash ? 'Cash' : 'SSLCommerz';

        const saleInsert = await pool.request()
            .input('total_amount', sql.Decimal(18, 2), total_amount)
            .input('tax_amount', sql.Decimal(18, 2), tax_amount)
            .input('final_amount', sql.Decimal(18, 2), final_amount)
            .input('payment_method', sql.NVarChar, method)
            .input('transaction_id', sql.NVarChar, tran_id)
            .input('status', sql.NVarChar, saleStatus)
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .query(`
                INSERT INTO sales (total_amount, tax_amount, final_amount, payment_method, transaction_id, status, branch)
                OUTPUT INSERTED.id
                VALUES (@total_amount, @tax_amount, @final_amount, @payment_method, @transaction_id, @status, @branch)
            `);
        const sale_id = saleInsert.recordset[0].id;

        for (const item of cart) {
            await pool.request()
                .input('sale_id', sql.Int, sale_id)
                .input('product_id', sql.Int, item.id)
                .input('quantity', sql.Int, item.qty)
                .input('price_at_sale', sql.Decimal(18, 2), item.price)
                .input('total_price', sql.Decimal(18, 2), item.price * item.qty)
                .query(`
                    INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale, total_price)
                    VALUES (@sale_id, @product_id, @quantity, @price_at_sale, @total_price)
                `);
        }

        if (isCash) {
            return res.json({ message: "Cash payment recorded successfully", success: true, tran_id: tran_id });
        }

        // SSLCommerz
        const data = {
            total_amount: final_amount,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `https://us-central1-gold-rush-web.cloudfunctions.net/api/api/payment/success/${tran_id}`,
            fail_url: `https://us-central1-gold-rush-web.cloudfunctions.net/api/api/payment/fail/${tran_id}`,
            cancel_url: `https://us-central1-gold-rush-web.cloudfunctions.net/api/api/payment/cancel/${tran_id}`,
            ipn_url: 'https://us-central1-gold-rush-web.cloudfunctions.net/api/api/payment/ipn',
            shipping_method: 'Courier',
            product_name: 'Jewelry Items',
            product_category: 'Jewelry',
            product_profile: 'general',
            cus_name: 'Walk-in Customer',
            cus_email: 'customer@example.com',
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };

        const sslcz = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD, process.env.IS_LIVE === 'true');
        sslcz.init(data).then(apiResponse => {
            if (apiResponse.GatewayPageURL) {
                res.send({ url: apiResponse.GatewayPageURL });
            } else {
                res.status(500).json({ error: "Payment Gateway Error" });
            }
        });

    } catch (err) {
        console.error("Error initiating payment:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Manufacturing Routes
app.get('/api/manufacturing', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('branch', sql.NVarChar, branch)
            .query('SELECT * FROM manufacturing_orders WHERE branch = @branch ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching manufacturing:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/manufacturing', async (req, res) => {
    const { order_id, customer_name, product_name, karigar_name, status, gold_weight, due_date, branch } = req.body;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('order_id', sql.NVarChar, order_id)
            .input('customer_name', sql.NVarChar, customer_name)
            .input('product_name', sql.NVarChar, product_name)
            .input('karigar_name', sql.NVarChar, karigar_name || null)
            .input('status', sql.NVarChar, status || 'New Orders')
            .input('gold_weight', sql.Float, gold_weight || 0)
            .input('due_date', sql.DateTime, due_date || null)
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .query(`
                INSERT INTO manufacturing_orders (order_id, customer_name, product_name, karigar_name, status, gold_weight, due_date, branch)
                OUTPUT INSERTED.*
                VALUES (@order_id, @customer_name, @product_name, @karigar_name, @status, @gold_weight, @due_date, @branch)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error creating manufacturing:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put('/api/manufacturing/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE manufacturing_orders SET status = @status OUTPUT INSERTED.* WHERE id = @id');
        if (result.recordset.length === 0) return res.status(404).json({ error: "Order not found" });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error updating manufacturing status:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Installments
app.get('/api/installments', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('branch', sql.NVarChar, branch)
            .query(`
            SELECT i.*, c.name as customer_name, c.phone as customer_phone
            FROM installments i
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.branch = @branch
            ORDER BY i.created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching installments:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/installments', async (req, res) => {
    const { customer_id, item_description, total_amount, paid_amount, due_date, branch } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('customer_id', sql.Int, customer_id)
            .input('item_description', sql.NVarChar, item_description)
            .input('total_amount', sql.Decimal(18, 2), total_amount)
            .input('paid_amount', sql.Decimal(18, 2), paid_amount || 0)
            .input('due_date', sql.Date, due_date)
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .query(`
                INSERT INTO installments (customer_id, item_description, total_amount, paid_amount, due_date, status, branch)
                VALUES (@customer_id, @item_description, @total_amount, @paid_amount, @due_date, 'Active', @branch)
            `);
        res.json({ message: "Installment plan created" });
    } catch (err) {
        console.error("Error creating installment:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Customers
app.get('/api/customers', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('branch', sql.NVarChar, branch)
            .query('SELECT * FROM customers WHERE branch = @branch');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/customers', async (req, res) => {
    const { name, phone, type, total_spent, last_visit, branch } = req.body;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phone', sql.NVarChar, phone)
            .input('type', sql.NVarChar, type || 'New')
            .input('total_spent', sql.Decimal(18, 2), total_spent || 0)
            .input('last_visit', sql.DateTime, last_visit || new Date())
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .query(`
                INSERT INTO customers (name, phone, type, total_spent, last_visit, branch)
                OUTPUT INSERTED.*
                VALUES (@name, @phone, @type, @total_spent, @last_visit, @branch)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error creating customer:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Admin / Branches
app.get('/api/branches', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM branches');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching branches:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Other required routes (Blog, Auth, etc)
// Mock Blog
app.get('/api/blog', (req, res) => {
    res.json([
        { id: 1, title: "The Future of Jewellery Management", excerpt: "Discover how digital tools are transforming...", date: "2023-10-25" },
        { id: 2, title: "Understanding Vori", excerpt: "A deep dive into local units...", date: "2023-11-10" }
    ]);
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { fullName, phone, identifier, password, latitude, longitude, shop_name, branch_count, tax_id } = req.body;
    try {
        const pool = await sql.connect();
        // Assume users table exists or handle creation like in server/index.js
        const checkUser = await pool.request().input('identifier', sql.NVarChar, identifier).query('SELECT * FROM users WHERE identifier = @identifier');
        if (checkUser.recordset.length > 0) return res.status(409).json({ error: "User exists" });

        const result = await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('phone', sql.NVarChar, phone)
            .input('identifier', sql.NVarChar, identifier)
            .input('password', sql.NVarChar, password)
            .input('latitude', sql.Float, Number(latitude))
            .input('longitude', sql.Float, Number(longitude))
            .input('shop_name', sql.NVarChar, shop_name || null)
            .input('branch_count', sql.Int, Number(branch_count) || 1)
            .input('tax_id', sql.NVarChar, tax_id || null)
            .query(`
                INSERT INTO users (full_name, phone, identifier, password, latitude, longitude, shop_name, branch_count, tax_id)
                OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.identifier
                VALUES (@fullName, @phone, @identifier, @password, @latitude, @longitude, @shop_name, @branch_count, @tax_id)
            `);
        res.status(201).json({ message: "User registered", user: result.recordset[0] });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Google Auth
app.post('/api/auth/google', async (req, res) => {
    const { email, fullName } = req.body;
    try {
        const pool = await sql.connect();
        const checkUser = await pool.request().input('identifier', sql.NVarChar, email).query('SELECT * FROM users WHERE identifier = @identifier');
        if (checkUser.recordset.length > 0) return res.json({ message: "Logged in", user: checkUser.recordset[0] });

        const result = await pool.request()
            .input('fullName', sql.NVarChar, fullName || 'Google User')
            .input('phone', sql.NVarChar, '')
            .input('identifier', sql.NVarChar, email)
            .input('password', sql.NVarChar, "GOOGLE_AUTH_DUMMY")
            .query(`
                INSERT INTO users (full_name, phone, identifier, password)
                OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.identifier
                VALUES (@fullName, @phone, @identifier, @password)
            `);
        res.status(201).json({ message: "Registered with Google", user: result.recordset[0] });
    } catch (err) {
        console.error("Google auth error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Health
app.get('/api/health', async (req, res) => {
    try {
        const pool = await sql.connect();
        await pool.request().query('SELECT 1');
        res.json({ status: 'connected', message: 'Database connection is healthy' });
    } catch (err) {
        res.status(500).json({ status: 'disconnected', message: 'Database connection failed' });
    }
});

exports.api = onRequest(app);

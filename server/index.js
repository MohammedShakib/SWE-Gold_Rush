const express = require('express');
const cors = require('cors');
const { sql, connectDB } = require('./db');
const SSLCommerzPayment = require('sslcommerz-lts');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to Database
// Connect to Database
// ... (imports remain same)

// Connect to Database
connectDB().then(async () => {
    try {
        const pool = await sql.connect();

        // 1. Schema Initialization (Tables + Branch Column)
        const tables = [
            'products', 'sales', 'manufacturing_orders', 'repair_tickets',
            'customers', 'shopowners', 'installments', 'branches'
        ];

        for (const table of tables) {
            // Skip 'shopowners' table for generic columns as it has its own schema definition
            if (table === 'shopowners') continue;

            // Check if 'branch' column exists, if not add it
            const checkColumnQuery = `
                IF COL_LENGTH('${table}', 'branch') IS NULL
                ALTER TABLE ${table} ADD branch NVARCHAR(255) DEFAULT 'Main Branch';

                IF COL_LENGTH('${table}', 'user_id') IS NULL
                ALTER TABLE ${table} ADD user_id INT NULL;
            `;
            await pool.request().query(checkColumnQuery);


        }



        // 1.1 Specific Schema Updates for Shop Owners
        const userSchemaUpdate = `
            IF COL_LENGTH('shopowners', 'shopowner_id') IS NULL
            ALTER TABLE shopowners ADD shopowner_id NVARCHAR(50) NULL;

            IF COL_LENGTH('shopowners', 'subscription_plan') IS NULL
            ALTER TABLE shopowners ADD subscription_plan NVARCHAR(50) DEFAULT 'free';

            IF COL_LENGTH('shopowners', 'subscription_status') IS NULL
            ALTER TABLE shopowners ADD subscription_status NVARCHAR(50) DEFAULT 'active';

            IF COL_LENGTH('shopowners', 'subscription_end_date') IS NULL
            ALTER TABLE shopowners ADD subscription_end_date DATETIME NULL;
        `;
        await pool.request().query(userSchemaUpdate);

        // 1.2 Backfill shopowner_id for existing shopowners
        await pool.request().query(`
            UPDATE shopowners 
            SET shopowner_id = 'SP-' + RIGHT('000' + CAST(id AS VARCHAR(10)), 3)
            WHERE shopowner_id IS NULL
        `);

        // 1.3 Add shopowner_id to branches and sync
        const branchSchemaUpdate = `
            IF COL_LENGTH('branches', 'shopowner_id') IS NULL
            ALTER TABLE branches ADD shopowner_id NVARCHAR(50) NULL;
        `;
        await pool.request().query(branchSchemaUpdate);

        await pool.request().query(`
            UPDATE b
            SET b.shopowner_id = u.shopowner_id
            FROM branches b
            INNER JOIN shopowners u ON b.user_id = u.id
            WHERE b.shopowner_id IS NULL OR b.shopowner_id != u.shopowner_id
        `);

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

        // Create Stock Transfers Table (Ensure columns exist)
        const createStockTransfersQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='stock_transfers' AND xtype='U')
            CREATE TABLE stock_transfers (
                id INT IDENTITY(1,1) PRIMARY KEY,
                transfer_id NVARCHAR(50) NOT NULL,
                from_branch NVARCHAR(255),
                to_branch NVARCHAR(255),
                items NVARCHAR(MAX),
                transfer_date DATETIME DEFAULT GETDATE(),
                status NVARCHAR(50) DEFAULT 'Pending',
                shopowner_id NVARCHAR(50),
                user_id INT
            );
        `;
        await pool.request().query(createStockTransfersQuery);

        // Force ensure columns exist (Self-healing)
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stock_transfers' AND COLUMN_NAME = 'shopowner_id')
                ALTER TABLE stock_transfers ADD shopowner_id NVARCHAR(50);
                
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stock_transfers' AND COLUMN_NAME = 'user_id')
                ALTER TABLE stock_transfers ADD user_id INT;
            `);
            console.log("Stock transfers schema verified.");
        } catch (schemaErr) {
            console.error("Error verifying stock_transfers schema:", schemaErr);
        }

        // 1.4 Enforce shopowner_id on generic tables and backfill
        const genericTables = ['sales', 'manufacturing_orders', 'repair_tickets', 'products', 'customers', 'installments'];
        for (const table of genericTables) {
            // Check if table exists
            const checkTable = await pool.request().query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${table}'`);
            if (checkTable.recordset.length > 0) {
                // Add shopowner_id column if missing
                await pool.request().query(`
                    IF COL_LENGTH('${table}', 'shopowner_id') IS NULL
                    ALTER TABLE ${table} ADD shopowner_id NVARCHAR(50) NULL;
                `);

                // Backfill shopowner_id from linked user_id (if exists)
                // We use a dynamic query to checking if user_id exists in the table to avoid errors
                const checkUserCol = await pool.request().query(`
                    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' AND COLUMN_NAME = 'user_id'
                `);

                if (checkUserCol.recordset.length > 0) {
                    await pool.request().query(`
                        UPDATE t
                        SET t.shopowner_id = s.shopowner_id
                        FROM ${table} t
                        JOIN shopowners s ON t.user_id = s.id
                        WHERE t.shopowner_id IS NULL
                    `);

                    // Fallback: If user_id is 1 (often used as default) and shopowner_id is still null, 
                    // maybe map to first shopowner? (Optional, skipping for now to be safe)
                }
            }
        }

        // ... (Other tables create queries similar pattern if needed or rely on alter) ...
        // Re-running create queries is safe due to IF NOT EXISTS, but we need to ensure they have branch col if created now.
        // The loop above ensures added column for existing tables. For new tables, we should add it in definition.

        console.log("Database schema synchronized (branch columns added).");

        // 2. Demo Data Generation
        // Check if demo data exists for 'Chittagong Branch' in 'products', if not, seed it.
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

// ... (Mock Data & Routes)

// Helper: Filter by branch
// We'll update GET requests to use req.query.branch (default 'Main Branch')
// We'll update POST/PUT requests to accept branch in body

// GET /api/inventory
// GET /api/inventory
app.get('/api/inventory', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    const { userId, shopownerId } = req.query;

    if (!shopownerId && !userId) {
        return res.status(400).json({ error: "Shop Owner ID is required" });
    }

    try {
        const pool = await sql.connect();
        let query = 'SELECT * FROM products WHERE branch = @branch';

        const request = pool.request().input('branch', sql.NVarChar, branch);

        if (shopownerId) {
            // Resolve shopownerId to userId for filtering
            const userRes = await pool.request().input('sid', sql.NVarChar, shopownerId).query("SELECT id FROM shopowners WHERE shopowner_id = @sid");
            const resolvedUserId = userRes.recordset.length > 0 ? userRes.recordset[0].id : -1;
            query += ' AND user_id = @userId';
            request.input('userId', sql.Int, resolvedUserId);
        } else if (userId) {
            query += ' AND user_id = @userId';
            request.input('userId', sql.Int, userId);
        }

        query += ' ORDER BY created_at DESC';
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/inventory
// POST /api/inventory
app.post('/api/inventory', async (req, res) => {
    const { name, category, karat, weight, price, stock_quantity, image_url, supplier_id, product_code, branch, userId, shopownerId } = req.body;

    try {
        const pool = await sql.connect();

        let resolvedUserId = userId;
        if (!resolvedUserId && shopownerId) {
            const userRes = await pool.request().input('sid', sql.NVarChar, shopownerId).query("SELECT id FROM shopowners WHERE shopowner_id = @sid");
            if (userRes.recordset.length > 0) resolvedUserId = userRes.recordset[0].id;
        }

        const insertQuery = `
            INSERT INTO products (name, category, karat, weight, price, stock_quantity, image_url, supplier_id, product_code, branch, user_id)
            OUTPUT INSERTED.*
            VALUES (@name, @category, @karat, @weight, @price, @stock_quantity, @image_url, @supplier_id, @product_code, @branch, @user_id)
        `;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('category', sql.NVarChar, category)
            .input('karat', sql.NVarChar, karat)
            .input('weight', sql.Float, weight)
            .input('price', sql.Decimal(18, 2), price)
            .input('stock_quantity', sql.Int, stock_quantity)
            .input('image_url', sql.NVarChar, image_url || 'https://placehold.co/400')
            .input('supplier_id', sql.Int, supplier_id || null)
            .input('product_code', sql.NVarChar, product_code || null)
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .input('user_id', sql.Int, resolvedUserId || null)
            .query(insertQuery);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/repairs
app.get('/api/repairs', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    const { shopownerId } = req.query;
    try {
        const pool = await sql.connect();
        let query = 'SELECT * FROM repair_tickets WHERE branch = @branch';
        const request = pool.request().input('branch', sql.NVarChar, branch);

        if (shopownerId) {
            query += ' AND shopowner_id = @shopownerId';
            request.input('shopownerId', sql.NVarChar, shopownerId);
        }

        query += ' ORDER BY created_at DESC';
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching repair tickets:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/repairs
app.post('/api/repairs', async (req, res) => {
    const { customer_name, customer_phone, item_name, issue_description, estimated_cost, due_date, branch, shopownerId } = req.body;
    try {
        const pool = await sql.connect();

        const ticket_id = `REP-${Date.now()}`;
        const insertQuery = `
            INSERT INTO repair_tickets (ticket_id, customer_name, customer_phone, item_name, issue_description, estimated_cost, due_date, branch, shopowner_id)
            OUTPUT INSERTED.*
            VALUES (@ticket_id, @customer_name, @customer_phone, @item_name, @issue_description, @estimated_cost, @due_date, @branch, @shopowner_id)
        `;

        await pool.request()
            .input('ticket_id', sql.NVarChar, ticket_id)
            .input('customer_name', sql.NVarChar, customer_name)
            .input('customer_phone', sql.NVarChar, customer_phone || null)
            .input('item_name', sql.NVarChar, item_name)
            .input('issue_description', sql.NVarChar, issue_description)
            .input('estimated_cost', sql.Decimal(18, 2), estimated_cost || 0)
            .input('due_date', sql.DateTime, due_date || null)
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .input('shopowner_id', sql.NVarChar, shopownerId || null)
            .query(insertQuery);
        res.status(201).json({ message: "Repair ticket created" });
    } catch (err) {
        console.error("Error creating repair ticket:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/sales
app.get('/api/sales', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    const { userId, shopownerId } = req.query;

    try {
        const pool = await sql.connect();
        let query = 'SELECT * FROM sales WHERE branch = @branch';
        const request = pool.request().input('branch', sql.NVarChar, branch);

        if (shopownerId) {
            const userRes = await pool.request().input('sid', sql.NVarChar, shopownerId).query("SELECT id FROM shopowners WHERE shopowner_id = @sid");
            const resolvedUserId = userRes.recordset.length > 0 ? userRes.recordset[0].id : -1;
            query += ' AND user_id = @userId';
            request.input('userId', sql.Int, resolvedUserId);
        } else if (userId) {
            query += ' AND user_id = @userId';
            request.input('userId', sql.Int, userId);
        }

        query += ' ORDER BY sale_date DESC';
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching sales:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/payment/init (Sales creation)
app.post('/api/payment/init', async (req, res) => {
    const { cart, paymentMethod, branch } = req.body;
    // ...
    try {
        // ... calculations ...
        const pool = await sql.connect();
        // ...
        const saleInsert = await pool.request()
            // ... inputs ...
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .query(`
                INSERT INTO sales (total_amount, tax_amount, final_amount, payment_method, transaction_id, status, branch)
                OUTPUT INSERTED.id
                VALUES (@total_amount, @tax_amount, @final_amount, @payment_method, @transaction_id, @status, @branch)
            `);
        // ...
    } catch (err) { // ...
    }
});

// ... Similar updates for other endpoints ...


// Mock Data
const mockBlogPosts = [
    {
        id: 1,
        title: "The Future of Jewellery Management",
        excerpt: "Discover how digital tools are transforming the traditional jewellery business in Bangladesh.",
        date: "2023-10-25"
    },
    {
        id: 2,
        title: "Understanding Vori, Ana, and Roti",
        excerpt: "A deep dive into the local weight units used in Bangladeshi jewellery and how to calculate them accurately.",
        date: "2023-11-10"
    },
    {
        id: 3,
        title: "Why You Need a Specialized POS",
        excerpt: "Generic POS systems often fail in jewellery shops. Learn why a specialized solution like Gold Rush is essential.",
        date: "2023-11-20"
    }
];

// Routes

// GET /api/blog
app.get('/api/blog', (req, res) => {
    res.json(mockBlogPosts);
});

// POST /api/contact
app.post('/api/contact', (req, res) => {
    const { name, phone, email } = req.body;
    console.log("------------------------------------------------");
    console.log("New Contact Form Submission:");
    console.log("Name:", name);
    console.log("Phone:", phone);
    console.log("Email:", email);
    console.log("------------------------------------------------");

    res.json({ message: "Query received successfully and logged on the server." });
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
    const { fullName, phone, identifier, password, latitude, longitude, shop_name, branch_count, tax_id } = req.body;
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const parsedBranchCount = Number(branch_count) || 1;

    // Validate Input
    if (!fullName || !phone || !identifier || !password || !Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
        return res.status(400).json({ error: "All fields are required, including shop location" });
    }

    try {
        const pool = await sql.connect(); // Ensure we have a connection

        // Create table if not exists (T-SQL)
        const createTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='shopowners' AND xtype='U')
            CREATE TABLE shopowners (
                id INT IDENTITY(1,1) PRIMARY KEY,
                full_name NVARCHAR(255) NOT NULL,
                phone NVARCHAR(50),
                identifier NVARCHAR(255) UNIQUE NOT NULL,
                password NVARCHAR(255) NOT NULL, -- Note: Should be hashed in production
                latitude FLOAT NULL,
                longitude FLOAT NULL,
                created_at DATETIME DEFAULT GETDATE()
            );
        `;
        await pool.request().query(createTableQuery);

        const addLocationColumnsQuery = `
            IF COL_LENGTH('shopowners', 'latitude') IS NULL
                ALTER TABLE shopowners ADD latitude FLOAT NULL;
            IF COL_LENGTH('shopowners', 'longitude') IS NULL
                ALTER TABLE shopowners ADD longitude FLOAT NULL;
            IF COL_LENGTH('shopowners', 'shop_name') IS NULL
                ALTER TABLE shopowners ADD shop_name NVARCHAR(255) NULL;
            IF COL_LENGTH('shopowners', 'branch_count') IS NULL
                ALTER TABLE shopowners ADD branch_count INT DEFAULT 1;
            IF COL_LENGTH('shopowners', 'tax_id') IS NULL
                ALTER TABLE shopowners ADD tax_id NVARCHAR(100) NULL;
            IF COL_LENGTH('shopowners', 'subscription_plan') IS NULL
                ALTER TABLE shopowners ADD subscription_plan NVARCHAR(50) DEFAULT 'free';
            IF COL_LENGTH('shopowners', 'subscription_status') IS NULL
                ALTER TABLE shopowners ADD subscription_status NVARCHAR(50) DEFAULT 'active';
            IF COL_LENGTH('shopowners', 'subscription_end_date') IS NULL
                ALTER TABLE shopowners ADD subscription_end_date DATETIME NULL;
                ALTER TABLE shopowners ADD subscription_end_date DATETIME NULL;

            IF COL_LENGTH('shopowners', 'shopowner_id') IS NULL
                ALTER TABLE shopowners ADD shopowner_id NVARCHAR(50) NULL;
        `;
        await pool.request().query(addLocationColumnsQuery);

        // Backfill shopowner_id if missing
        await pool.request().query(`
            UPDATE shopowners 
            SET shopowner_id = 'SP-' + RIGHT('000' + CAST(id AS VARCHAR(10)), 3)
            WHERE shopowner_id IS NULL
        `);

        // Check if user exists
        const checkUserQuery = 'SELECT * FROM users WHERE identifier = @identifier';
        const userExists = await pool.request()
            .input('identifier', sql.NVarChar, identifier)
            .query(checkUserQuery);

        if (userExists.recordset.length > 0) {
            return res.status(409).json({ error: "User already exists with this email/phone" });
        }

        // Logic for Subscription
        let subscriptionStatus = 'active'; // Default active for free
        const selectedPlan = req.body.plan || 'free';
        const planAmount = req.body.amount || 0;

        if (selectedPlan !== 'free' && planAmount > 0) {
            subscriptionStatus = 'pending';
        }

        // Insert new user
        const insertUserQuery = `
            INSERT INTO shopowners (full_name, phone, identifier, password, latitude, longitude, shop_name, branch_count, tax_id, subscription_plan, subscription_status)
            OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.identifier
            VALUES (@fullName, @phone, @identifier, @password, @latitude, @longitude, @shop_name, @branch_count, @tax_id, @subscription_plan, @subscription_status);
        `;

        const request = pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('phone', sql.NVarChar, phone)
            .input('identifier', sql.NVarChar, identifier)
            .input('password', sql.NVarChar, password)
            .input('latitude', sql.Float, parsedLatitude)
            .input('longitude', sql.Float, parsedLongitude)
            .input('shop_name', sql.NVarChar, shop_name || null)
            .input('branch_count', sql.Int, parsedBranchCount)
            .input('tax_id', sql.NVarChar, tax_id || null)
            .input('subscription_plan', sql.NVarChar, selectedPlan)
            .input('subscription_status', sql.NVarChar, subscriptionStatus);

        const result = await request.query(insertUserQuery);

        const newUser = result.recordset[0];

        // Generate and Update shopowner_id
        const shopownerId = `SP-${String(newUser.id).padStart(3, '0')}`;
        await pool.request()
            .input('shopownerId', sql.NVarChar, shopownerId)
            .input('id', sql.Int, newUser.id)
            .query('UPDATE shopowners SET shopowner_id = @shopownerId WHERE id = @id');

        // Return the new ID in response
        newUser.shopowner_id = shopownerId;

        // Create Default Branch for the user
        await pool.request()
            .input('name', sql.NVarChar, 'Main Branch')
            .input('location', sql.NVarChar, shop_name + ' Location')
            .input('user_id', sql.Int, newUser.id)
            .query(`
                INSERT INTO branches (name, location, status, daily_sales, stock_value, user_id)
                VALUES (@name, @location, 'Active', 0, '0', @user_id)
            `);

        let paymentUrl = null;

        if (selectedPlan !== 'free' && planAmount > 0) {
            try {
                const tran_id = `SUB-${uuidv4()}`;
                const paymentData = {
                    total_amount: planAmount,
                    currency: 'BDT',
                    tran_id: tran_id,
                    success_url: `http://localhost:5000/api/payment/success/${tran_id}`,
                    fail_url: `http://localhost:5000/api/payment/fail/${tran_id}`,
                    cancel_url: `http://localhost:5000/api/payment/cancel/${tran_id}`,
                    ipn_url: `http://localhost:5000/api/payment/ipn`,
                    shipping_method: 'Courier',
                    product_name: `${selectedPlan} Subscription`,
                    product_category: 'Service',
                    product_profile: 'general',
                    cus_name: fullName,
                    cus_email: identifier,
                    cus_add1: 'Dhaka',
                    cus_add2: 'Dhaka',
                    cus_city: 'Dhaka',
                    cus_state: 'Dhaka',
                    cus_postcode: '1000',
                    cus_country: 'Bangladesh',
                    cus_phone: phone,
                    cus_fax: phone,
                    ship_name: fullName,
                    ship_add1: 'Dhaka',
                    ship_add2: 'Dhaka',
                    ship_city: 'Dhaka',
                    ship_state: 'Dhaka',
                    ship_postcode: 1000,
                    ship_country: 'Bangladesh',
                };

                const sslcz = new SSLCommerzPayment(process.env.STORE_ID || 'testbox', process.env.STORE_PASSWORD || 'qwerty', false);
                const apiResponse = await sslcz.init(paymentData);

                if (apiResponse?.GatewayPageURL) {
                    paymentUrl = apiResponse.GatewayPageURL;
                } else {
                    console.error("SSLCommerz Init Failed", apiResponse);
                }
            } catch (paymentError) {
                console.error("Payment Init Error:", paymentError);
                // Non-fatal for signup, but user will be trapped in pending.
            }
        }

        console.log("New User Registered:", newUser, "Plan:", selectedPlan, "Payment URL:", paymentUrl);

        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
            paymentUrl
        });

    } catch (err) {
        console.error("Error in signup:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login Endpoint
app.post('/api/auth/signin', async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: "Email/Phone and Password are required" });
    }

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('identifier', sql.NVarChar, identifier)
            .query('SELECT * FROM shopowners WHERE identifier = @identifier');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.recordset[0];

        // Simple password comparison (User signup uses plain text currently)
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            user: user
        });

    } catch (err) {
        console.error("Error in signin:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update Subscription Plan
app.post('/api/subscription/update', async (req, res) => {
    const { shopownerId, plan, amount } = req.body;
    const planAmount = amount || 0;

    if (!shopownerId || !plan) {
        return res.status(400).json({ error: "Shop Owner ID and Plan are required" });
    }

    try {
        const pool = await sql.connect();

        // Find user by shopownerId
        const userRes = await pool.request().input('sid', sql.NVarChar, shopownerId).query('SELECT * FROM shopowners WHERE shopowner_id = @sid');

        if (userRes.recordset.length === 0) {
            return res.status(404).json({ error: "Shop Owner not found" });
        }

        const user = userRes.recordset[0];
        const userId = user.id;

        let subscriptionStatus = 'active'; // Default active for free
        let endDate = new Date();

        if (plan === 'free') {
            endDate.setDate(endDate.getDate() + 7); // 7 days trial
        } else if (plan === 'monthly') {
            // For paid, status pending until payment success
            subscriptionStatus = 'pending';
            // Date will be set on payment success, but we can preset it or leave null
            endDate = null;
        } else if (plan === 'yearly') {
            subscriptionStatus = 'pending';
            endDate = null;
        } else if (plan === 'lifetime') {
            subscriptionStatus = 'pending';
            endDate = null; // or far future on success
        }

        // Update User
        // If free, set date immediately. If pending, keep date null or current? 
        // Better to not touch date if pending, or set it only if free.

        let updateQuery = `
                 UPDATE shopowners 
                 SET subscription_plan = @plan, subscription_status = @status 
        `;

        if (plan === 'free') {
            updateQuery += `, subscription_end_date = @endDate `;
        }

        updateQuery += ` WHERE id = @userId `;

        const req = pool.request()
            .input('userId', sql.Int, userId)
            .input('plan', sql.NVarChar, plan)
            .input('status', sql.NVarChar, subscriptionStatus);

        if (plan === 'free') {
            req.input('endDate', sql.DateTime, endDate);
        }

        await req.query(updateQuery);

        let paymentUrl = null;

        if (plan !== 'free' && planAmount > 0 && user) {
            try {
                const tran_id = `SUB-${uuidv4()}`;
                const paymentData = {
                    total_amount: planAmount,
                    currency: 'BDT',
                    tran_id: tran_id,
                    success_url: `http://localhost:5000/api/payment/success/${tran_id}`,
                    fail_url: `http://localhost:5000/api/payment/fail/${tran_id}`,
                    cancel_url: `http://localhost:5000/api/payment/cancel/${tran_id}`,
                    ipn_url: `http://localhost:5000/api/payment/ipn`,
                    shipping_method: 'Courier',
                    product_name: `${plan} Subscription`,
                    product_category: 'Service',
                    product_profile: 'general',
                    cus_name: user.full_name,
                    cus_email: user.identifier,
                    cus_add1: 'Dhaka',
                    cus_add2: 'Dhaka',
                    cus_city: 'Dhaka',
                    cus_state: 'Dhaka',
                    cus_postcode: '1000',
                    cus_country: 'Bangladesh',
                    cus_phone: user.phone,
                    cus_fax: user.phone,
                    ship_name: user.full_name,
                    ship_add1: 'Dhaka',
                    ship_add2: 'Dhaka',
                    ship_city: 'Dhaka',
                    ship_state: 'Dhaka',
                    ship_postcode: 1000,
                    ship_country: 'Bangladesh',
                };

                const sslcz = new SSLCommerzPayment(process.env.STORE_ID || 'testbox', process.env.STORE_PASSWORD || 'qwerty', false);
                const apiResponse = await sslcz.init(paymentData);

                if (apiResponse?.GatewayPageURL) {
                    paymentUrl = apiResponse.GatewayPageURL;
                    // Log transaction
                    await pool.request()
                        .input('planAmount', sql.Decimal(18, 2), planAmount)
                        .input('tran_id', sql.NVarChar, tran_id)
                        .input('shopownerId', sql.NVarChar, shopownerId)
                        .query(`
                        INSERT INTO sales (total_amount, tax_amount, final_amount, payment_method, transaction_id, status, branch, shopowner_id)
                        VALUES (@planAmount, 0, @planAmount, 'Online', @tran_id, 'Pending', 'Subscription', @shopownerId)
                    `);
                } else {
                    console.error("SSLCommerz Init Failed", apiResponse);
                }
            } catch (paymentError) {
                console.error("Payment Init Error:", paymentError);
            }
        }

        res.json({ success: true, paymentUrl });

    } catch (err) {
        console.error("Subscription update error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
    const { email, fullName, photoURL } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const pool = await sql.connect();

        // Check if user exists
        const checkUserQuery = 'SELECT * FROM shopowners WHERE identifier = @identifier';
        const userExists = await pool.request()
            .input('identifier', sql.NVarChar, email)
            .query(checkUserQuery);

        if (userExists.recordset.length > 0) {
            // User exists, return user info
            const user = userExists.recordset[0];
            return res.json({
                message: "Logged in with Google",
                user: user
            });
        }

        // Create new user
        // We set a dummy password for Google users. 
        // In a real app, we might handle this differently (e.g. separate auth_provider table).
        const dummyPassword = "GOOGLE_AUTH_" + Math.random().toString(36).substring(7);

        const insertUserQuery = `
            INSERT INTO shopowners (full_name, phone, identifier, password)
            OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.identifier
            VALUES (@fullName, @phone, @identifier, @password);
        `;

        const result = await pool.request()
            .input('fullName', sql.NVarChar, fullName || 'Google User')
            .input('phone', sql.NVarChar, '') // Phone is unknown from Google
            .input('identifier', sql.NVarChar, email)
            .input('password', sql.NVarChar, dummyPassword)
            .query(insertUserQuery);

        const newUser = result.recordset[0];

        console.log("New Google User Registered:", newUser);

        res.status(201).json({
            message: "User registered with Google",
            user: newUser
        });

    } catch (err) {
        console.error("Error in google auth:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// GET /api/inventory
app.get('/api/inventory', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    const { shopownerId } = req.query;

    try {
        const pool = await sql.connect();

        let query = 'SELECT * FROM products WHERE branch = @branch';
        const request = pool.request().input('branch', sql.NVarChar, branch);

        if (shopownerId) {
            query += ' AND shopowner_id = @shopownerId';
            request.input('shopownerId', sql.NVarChar, shopownerId);
        }

        query += ' ORDER BY created_at DESC';
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/inventory
app.post('/api/inventory', async (req, res) => {
    const { name, category, karat, weight, price, stock_quantity, image_url, supplier_id, product_code, branch, shopownerId } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: "Name and Price are required" });
    }

    try {
        const pool = await sql.connect();
        const insertQuery = `
            INSERT INTO products (name, category, karat, weight, price, stock_quantity, image_url, supplier_id, product_code, branch, shopowner_id)
            OUTPUT INSERTED.*
            VALUES (@name, @category, @karat, @weight, @price, @stock_quantity, @image_url, @supplier_id, @product_code, @branch, @shopowner_id)
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
            .input('shopowner_id', sql.NVarChar, shopownerId || null)
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
            SET 
                name = @name, 
                category = @category, 
                karat = @karat, 
                weight = @weight, 
                price = @price, 
                stock_quantity = @stock_quantity, 
                image_url = @image_url,
                status = @status
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
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM products WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/installments
app.get('/api/installments', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    const { shopownerId } = req.query;

    try {
        const pool = await sql.connect();

        let query = `
            SELECT i.*, c.name as customer_name, c.phone as customer_phone
            FROM installments i
            LEFT JOIN customers c ON i.customer_id = c.id
            LEFT JOIN shopowners u ON i.shopowner_id = u.shopowner_id
            WHERE i.branch = @branch
        `;

        const request = pool.request().input('branch', sql.NVarChar, branch);

        if (shopownerId) {
            query += ' AND i.shopowner_id = @shopownerId';
            request.input('shopownerId', sql.NVarChar, shopownerId);
        }

        query += ' ORDER BY i.created_at DESC';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching installments:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/installments
app.post('/api/installments', async (req, res) => {
    const { customer_id, item_description, total_amount, paid_amount, due_date, branch, shopownerId } = req.body;
    try {
        const pool = await sql.connect();

        await pool.request()
            .input('customer_id', sql.Int, customer_id)
            .input('item_description', sql.NVarChar, item_description)
            .input('total_amount', sql.Decimal(18, 2), total_amount)
            .input('paid_amount', sql.Decimal(18, 2), paid_amount || 0)
            .input('due_date', sql.Date, due_date)
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .input('shopowner_id', sql.NVarChar, shopownerId || null)
            .query(`
                INSERT INTO installments (customer_id, item_description, total_amount, paid_amount, due_date, status, branch, shopowner_id)
                VALUES (@customer_id, @item_description, @total_amount, @paid_amount, @due_date, 'Active', @branch, @shopowner_id)
            `);
        res.json({ message: "Installment plan created" });
    } catch (err) {
        console.error("Error creating installment:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/installments/:id/payments
app.get('/api/installments/:id/payments', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM installment_payments WHERE installment_id = @id ORDER BY payment_date DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/installments/:id/payments
app.post('/api/installments/:id/payments', async (req, res) => {
    const { id } = req.params;
    const { amount, payment_method, notes } = req.body;
    try {
        const pool = await sql.connect();

        // 1. Insert Payment
        await pool.request()
            .input('installment_id', sql.Int, id)
            .input('amount', sql.Decimal(18, 2), amount)
            .input('payment_method', sql.NVarChar, payment_method)
            .input('notes', sql.NVarChar, notes)
            .query(`
                INSERT INTO installment_payments (installment_id, amount, payment_method, notes)
                VALUES (@installment_id, @amount, @payment_method, @notes)
            `);

        // 2. Update Parent Installment (Paid Amount & Status)
        await pool.request()
            .input('id', sql.Int, id)
            .input('amount', sql.Decimal(18, 2), amount)
            .query(`
                UPDATE installments 
                SET paid_amount = paid_amount + @amount,
                    status = CASE WHEN (paid_amount + @amount) >= total_amount THEN 'Completed' ELSE status END
                WHERE id = @id
            `);

        res.json({ message: "Payment recorded successfully" });
    } catch (err) {
        console.error("Error recording payment:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/customers
app.get('/api/customers', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    const { shopownerId } = req.query;
    try {
        const pool = await sql.connect();

        let query = 'SELECT * FROM customers WHERE branch = @branch';
        const request = pool.request().input('branch', sql.NVarChar, branch);

        if (shopownerId) {
            query += ' AND shopowner_id = @shopownerId';
            request.input('shopownerId', sql.NVarChar, shopownerId);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/customers
app.post('/api/customers', async (req, res) => {
    const { name, phone, type, total_spent, last_visit, branch, shopownerId } = req.body;
    try {
        const pool = await sql.connect();

        const insertQuery = `
            INSERT INTO customers (name, phone, type, total_spent, last_visit, branch, shopowner_id)
            OUTPUT INSERTED.*
            VALUES (@name, @phone, @type, @total_spent, @last_visit, @branch, @shopowner_id)
        `;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phone', sql.NVarChar, phone)
            .input('type', sql.NVarChar, type || 'New')
            .input('total_spent', sql.Decimal(18, 2), total_spent || 0)
            .input('last_visit', sql.DateTime, last_visit || new Date())
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .input('shopowner_id', sql.NVarChar, shopownerId || null)
            .query(insertQuery);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error creating customer:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/customers/:id
app.put('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { type, name, phone } = req.body;
    try {
        const pool = await sql.connect();
        // Dynamic update query
        let query = 'UPDATE customers SET ';
        const updates = [];
        if (type) updates.push("type = @type");
        if (name) updates.push("name = @name");
        if (phone) updates.push("phone = @phone");

        query += updates.join(", ");
        query += " OUTPUT INSERTED.* WHERE id = @id";

        const request = pool.request().input('id', sql.Int, id);
        if (type) request.input('type', sql.NVarChar, type);
        if (name) request.input('name', sql.NVarChar, name);
        if (phone) request.input('phone', sql.NVarChar, phone);

        const result = await request.query(query);

        if (result.recordset.length === 0) return res.status(404).json({ error: "Customer not found" });

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error updating customer:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/customers/:id
app.delete('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM customers WHERE id = @id');

        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: "Customer not found" });

        res.json({ message: "Customer deleted successfully" });
    } catch (err) {
        console.error("Error deleting customer:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// ... existing code ...

// GET /api/sales
app.get('/api/sales', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    const shopownerId = req.query.shopownerId;

    try {
        const pool = await sql.connect();
        let query = 'SELECT * FROM sales WHERE branch = @branch';

        if (shopownerId) {
            query += ' AND shopowner_id = @shopownerId';
        }

        query += ' ORDER BY sale_date DESC';

        const request = pool.request().input('branch', sql.NVarChar, branch);
        if (shopownerId) request.input('shopownerId', sql.NVarChar, shopownerId);

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching sales:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/sales/:id
app.get('/api/sales/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();

        // Fetch Sale Details
        const saleResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM sales WHERE id = @id');

        if (saleResult.recordset.length === 0) {
            return res.status(404).json({ error: "Sale not found" });
        }

        // Fetch Sale Items
        const itemsResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT si.*, p.name as product_name, p.image_url, p.product_code
                FROM sale_items si
                LEFT JOIN products p ON si.product_id = p.id
                WHERE si.sale_id = @id
            `);

        res.json({
            sale: saleResult.recordset[0],
            items: itemsResult.recordset
        });
    } catch (err) {
        console.error("Error fetching sale details:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/sales/:id
app.delete('/api/sales/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        // Delete items first (foreign key constraint)
        await pool.request().input('id', sql.Int, id).query('DELETE FROM sale_items WHERE sale_id = @id');
        // Delete sale
        await pool.request().input('id', sql.Int, id).query('DELETE FROM sales WHERE id = @id');

        res.json({ message: "Sale record deleted" });
    } catch (err) {
        console.error("Error deleting sale:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/sales/:id
app.put('/api/sales/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE sales SET status = @status WHERE id = @id');
        res.json({ message: "Sale status updated" });
    } catch (err) {
        console.error("Error updating sale:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/payment/init
app.post('/api/payment/init', async (req, res) => {
    const { cart, paymentMethod, shopownerId } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    try {
        const total_amount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const tax_amount = total_amount * 0.05;
        const final_amount = total_amount + tax_amount;
        const tran_id = uuidv4();

        const pool = await sql.connect();

        // Determine status and method based on input
        const isCash = paymentMethod === 'Cash';
        const saleStatus = isCash ? 'Completed' : 'Pending';
        const method = isCash ? 'Cash' : 'SSLCommerz';

        // Insert Sale (Using shopowner_id, skipping user_id)
        const saleInsert = await pool.request()
            .input('total_amount', sql.Decimal(18, 2), total_amount)
            .input('tax_amount', sql.Decimal(18, 2), tax_amount)
            .input('final_amount', sql.Decimal(18, 2), final_amount)
            .input('payment_method', sql.NVarChar, method)
            .input('transaction_id', sql.NVarChar, tran_id)
            .input('status', sql.NVarChar, saleStatus)
            .input('branch', sql.NVarChar, req.body.branch || 'Main Branch')
            .input('shopowner_id', sql.NVarChar, shopownerId || null)
            .query(`
                INSERT INTO sales (total_amount, tax_amount, final_amount, payment_method, transaction_id, status, branch, shopowner_id)
                OUTPUT INSERTED.id
                VALUES (@total_amount, @tax_amount, @final_amount, @payment_method, @transaction_id, @status, @branch, @shopowner_id)
            `);

        const sale_id = saleInsert.recordset[0].id;

        // Insert Sale Items
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

        // If Cash, return success immediately
        if (isCash) {
            return res.json({
                message: "Cash payment recorded successfully",
                success: true,
                tran_id: tran_id
            });
        }

        // Init SSLCommerz for Online Payment
        const data = {
            total_amount: final_amount,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `http://localhost:5000/api/payment/success/${tran_id}`,
            fail_url: `http://localhost:5000/api/payment/fail/${tran_id}`,
            cancel_url: `http://localhost:5000/api/payment/cancel/${tran_id}`,
            ipn_url: 'http://localhost:5000/api/payment/ipn',
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
            let GatewayPageURL = apiResponse.GatewayPageURL;
            if (GatewayPageURL) {
                res.send({ url: GatewayPageURL });
            } else {
                console.error("SSLCommerz Init Failed:", apiResponse);
                res.status(500).json({ error: "Payment Gateway Error" });
            }
        });

    } catch (err) {
        console.error("Error initiating payment:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Payment Success
app.post('/api/payment/success/:tran_id', async (req, res) => {
    const { tran_id } = req.params;
    try {
        const pool = await sql.connect();

        // 1. Update Sales Record
        const saleUpdate = await pool.request()
            .input('transaction_id', sql.NVarChar, tran_id)
            .query(`
                UPDATE sales 
                SET status = 'Completed' 
                OUTPUT INSERTED.total_amount, INSERTED.branch, INSERTED.transaction_id
                WHERE transaction_id = @transaction_id
            `);

        if (saleUpdate.recordset.length > 0) {
            const sale = saleUpdate.recordset[0];

            // 2. Check if this is a subscription payment
            // 2. Check if this is a subscription payment
            if (sale.branch === 'Subscription') {
                try {
                    const saleDetails = await pool.request()
                        .input('tid', sql.NVarChar, tran_id)
                        .query("SELECT * FROM sales WHERE transaction_id = @tid");

                    if (saleDetails.recordset.length > 0) {
                        const fullSale = saleDetails.recordset[0];
                        const shopownerId = fullSale.shopowner_id;

                        if (shopownerId) {
                            const userRes = await pool.request()
                                .input('sid', sql.NVarChar, shopownerId)
                                .query("SELECT id, subscription_plan FROM shopowners WHERE shopowner_id = @sid");

                            if (userRes.recordset.length > 0) {
                                const user = userRes.recordset[0];
                                const plan = user.subscription_plan;
                                let days = 30;
                                if (plan === 'yearly') days = 365;
                                if (plan === 'lifetime') days = 36500; // 100 years
                                if (plan === 'monthly') days = 30;

                                const endDate = new Date();
                                endDate.setDate(endDate.getDate() + days);

                                await pool.request()
                                    .input('uid', sql.Int, user.id)
                                    .input('endDate', sql.DateTime, endDate)
                                    .query(`
                                         UPDATE shopowners 
                                         SET subscription_status = 'active', subscription_end_date = @endDate
                                         WHERE id = @uid
                                     `);
                                console.log(`Subscription activated for shopowner ${shopownerId}, Plan: ${plan}, End: ${endDate}`);
                            }
                        }
                    }
                } catch (subErr) {
                    console.error("Subscription activation error:", subErr);
                }
                return res.redirect('http://localhost:5173/shopowner/profile?status=success');
            }
        }

        res.redirect('http://localhost:5173/shopowner/sales?status=success');
    } catch (err) {
        console.error("Payment success error:", err);
        res.redirect('http://localhost:5173/shopowner/sales?status=error');
    }
});

// Manufacturing Routes

// GET /api/manufacturing
app.get('/api/manufacturing', async (req, res) => {
    const branch = req.query.branch || 'Main Branch';
    const { shopownerId } = req.query;

    try {
        const pool = await sql.connect();
        let query = 'SELECT * FROM manufacturing_orders WHERE branch = @branch';
        const request = pool.request().input('branch', sql.NVarChar, branch);

        if (shopownerId) {
            query += ' AND shopowner_id = @shopownerId';
            request.input('shopownerId', sql.NVarChar, shopownerId);
        }

        query += ' ORDER BY created_at DESC';
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching manufacturing orders:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/manufacturing
// POST /api/manufacturing
app.post('/api/manufacturing', async (req, res) => {
    const { order_id, customer_name, product_name, karigar_name, status, gold_weight, due_date, branch, shopownerId } = req.body;

    try {
        const pool = await sql.connect();

        const insertQuery = `
            INSERT INTO manufacturing_orders (order_id, customer_name, product_name, karigar_name, status, gold_weight, due_date, branch, shopowner_id)
            OUTPUT INSERTED.*
            VALUES (@order_id, @customer_name, @product_name, @karigar_name, @status, @gold_weight, @due_date, @branch, @shopowner_id)
        `;

        const result = await pool.request()
            .input('order_id', sql.NVarChar, order_id)
            .input('customer_name', sql.NVarChar, customer_name)
            .input('product_name', sql.NVarChar, product_name)
            .input('karigar_name', sql.NVarChar, karigar_name || null)
            .input('status', sql.NVarChar, status || 'New Orders')
            .input('gold_weight', sql.Float, gold_weight || 0)
            .input('due_date', sql.DateTime, due_date || null)
            .input('branch', sql.NVarChar, branch || 'Main Branch')
            .input('shopowner_id', sql.NVarChar, shopownerId || null)
            .query(insertQuery);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error creating manufacturing order:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/manufacturing/:id/status
app.put('/api/manufacturing/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query(`
                UPDATE manufacturing_orders 
                SET status = @status 
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Admin Control Routes

// GET /api/branches
// GET /api/branches
app.get('/api/branches', async (req, res) => {
    const { userId, shopownerId } = req.query;

    if (!shopownerId && !userId) {
        return res.status(400).json({ error: "Shop Owner ID is required" });
    }

    try {
        const pool = await sql.connect();
        let query = 'SELECT * FROM branches WHERE shopowner_id = @shopownerId';

        const request = pool.request();

        if (shopownerId) {
            request.input('shopownerId', sql.NVarChar, shopownerId);
        } else if (userId) {
            // Fallback for backward compatibility if frontend sends userId
            query = `
                SELECT b.* FROM branches b
                INNER JOIN shopowners u ON b.shopowner_id = u.shopowner_id
                WHERE u.id = @userId
            `;
            request.input('userId', sql.Int, userId);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching branches:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/branches
app.post('/api/branches', async (req, res) => {
    const { name, location, shopownerId, userId } = req.body;

    if (!shopownerId && !userId) {
        return res.status(400).json({ error: "Shop Owner ID is required" });
    }

    try {
        const pool = await sql.connect();

        // Resolve shopownerId if only userId is provided
        let resolvedShopownerId = shopownerId;
        let resolvedUserId = userId;

        if (!resolvedShopownerId && resolvedUserId) {
            const userResult = await pool.request()
                .input('uid', sql.Int, resolvedUserId)
                .query("SELECT shopowner_id FROM shopowners WHERE id = @uid");
            if (userResult.recordset.length > 0) {
                resolvedShopownerId = userResult.recordset[0].shopowner_id;
            }
        }

        // Also resolve userId if only shopownerId provided (for foreign key)
        if (!resolvedUserId && resolvedShopownerId) {
            const userResult = await pool.request()
                .input('sid', sql.NVarChar, resolvedShopownerId)
                .query("SELECT id FROM shopowners WHERE shopowner_id = @sid");
            if (userResult.recordset.length > 0) {
                resolvedUserId = userResult.recordset[0].id;
            }
        }

        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('location', sql.NVarChar, location)
            .input('shopownerId', sql.NVarChar, resolvedShopownerId)
            .input('userId', sql.Int, resolvedUserId)
            .query(`
                INSERT INTO branches (name, location, status, daily_sales, stock_value, shopowner_id, user_id)
                VALUES (@name, @location, 'Active', 0, '0', @shopownerId, @userId)
            `);
        res.status(201).json({ message: "Branch created successfully" });
    } catch (err) {
        console.error("Error creating branch:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/branches/:id
app.put('/api/branches/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location, daily_sales, stock_value, status } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('location', sql.NVarChar, location)
            .input('daily_sales', sql.Decimal(18, 2), daily_sales)
            .input('stock_value', sql.NVarChar, stock_value)
            .input('status', sql.NVarChar, status)
            .query(`
                UPDATE branches 
                SET name = @name, location = @location, daily_sales = @daily_sales, stock_value = @stock_value, status = @status
                WHERE id = @id
            `);
        res.json({ message: "Branch updated successfully" });
    } catch (err) {
        console.error("Error updating branch:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/branches/:id
app.delete('/api/branches/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM branches WHERE id = @id');
        res.json({ message: "Branch deleted successfully" });
    } catch (err) {
        console.error("Error deleting branch:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/user-profile
app.get('/api/user-profile', async (req, res) => {
    const { userId, shopownerId } = req.query;
    try {
        const pool = await sql.connect();
        let query = 'SELECT TOP 1 * FROM shopowners'; // Dangerous fallback, should remove

        if (shopownerId) {
            query = `SELECT * FROM shopowners WHERE shopowner_id = @shopownerId`;
        } else if (userId) {
            query = `SELECT * FROM shopowners WHERE id = @userId`;
        } else {
            return res.status(400).json({ error: "User ID or Shop Owner ID required" });
        }

        const request = pool.request();
        if (shopownerId) request.input('shopownerId', sql.NVarChar, shopownerId);
        if (userId) request.input('userId', sql.Int, userId);

        const result = await request.query(query);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/user-profile
app.put('/api/user-profile', async (req, res) => {
    const { id, full_name, phone, identifier } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('full_name', sql.NVarChar, full_name)
            .input('phone', sql.NVarChar, phone)
            .input('identifier', sql.NVarChar, identifier)
            .query(`
                UPDATE shopowners 
                SET full_name = @full_name, phone = @phone, identifier = @identifier
                WHERE id = @id
            `);
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Error updating user profile:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/change-password
app.post('/api/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    try {
        const pool = await sql.connect();

        // precise verification (replace with hash comparison in production)
        const userResult = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT password FROM shopowners WHERE id = @id');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userResult.recordset[0];
        if (user.password !== currentPassword) {
            return res.status(401).json({ error: "Incorrect current password" });
        }

        await pool.request()
            .input('id', sql.Int, userId)
            .input('password', sql.NVarChar, newPassword)
            .query('UPDATE shopowners SET password = @password WHERE id = @id');

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/stock-transfers
app.get('/api/stock-transfers', async (req, res) => {
    const { userId, shopownerId } = req.query;
    try {
        const pool = await sql.connect();

        let query = 'SELECT * FROM stock_transfers';

        // Isolation Logic
        if (shopownerId) {
            query += " WHERE shopowner_id = @shopownerId";
        } else if (userId) {
            query += " WHERE user_id = @userId";
        } else {
            // If neither provided, return empty or require generic filtering?
            // For safety, require at least one, or return empty.
            // But existing code might break if we strictly enforce without frontend update first.
            // Given goal is isolation for shopowner, let's enforce if possible.
            // If backend is public, we must enforce.
            // Assume fallback to empty if no ID.
            query += " WHERE 1=0";
        }

        query += ' ORDER BY transfer_date DESC';

        const request = pool.request();
        if (shopownerId) request.input('shopownerId', sql.NVarChar, shopownerId);
        if (userId) request.input('userId', sql.Int, userId);

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching transfers:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/stock-transfers
app.post('/api/stock-transfers', async (req, res) => {
    const { from_branch, to_branch, items, userId, shopownerId } = req.body;
    try {
        const transfer_id = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
        const pool = await sql.connect();

        let resolvedUserId = userId;
        let resolvedShopownerId = shopownerId;

        // Validation / Resolution (reuse logic from others if consistent)
        if (!resolvedUserId && resolvedShopownerId) {
            const userRes = await pool.request().input('sid', sql.NVarChar, resolvedShopownerId).query("SELECT id FROM shopowners WHERE shopowner_id = @sid");
            if (userRes.recordset.length > 0) resolvedUserId = userRes.recordset[0].id;
        }

        await pool.request()
            .input('transfer_id', sql.NVarChar, transfer_id)
            .input('from_branch', sql.NVarChar, from_branch)
            .input('to_branch', sql.NVarChar, to_branch)
            .input('items', sql.NVarChar, items)
            .input('shopowner_id', sql.NVarChar, resolvedShopownerId || null)
            .input('user_id', sql.Int, resolvedUserId || null)
            .query(`
                INSERT INTO stock_transfers (transfer_id, from_branch, to_branch, items, transfer_date, status, shopowner_id, user_id)
                VALUES (@transfer_id, @from_branch, @to_branch, @items, GETDATE(), 'Pending', @shopowner_id, @user_id)
            `);

        res.status(201).json({ message: "Transfer created successfully" });
    } catch (err) {
        console.error("Error creating transfer:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/stock-transfers/:id/status
app.put('/api/stock-transfers/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE stock_transfers SET status = @status WHERE id = @id');

        res.json({ message: "Transfer status updated" });
    } catch (err) {
        console.error("Error updating transfer status:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// DELETE /api/manufacturing/:id
app.delete('/api/manufacturing/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM manufacturing_orders WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        console.error("Error deleting manufacturing order:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post('/api/payment/fail/:tran_id', async (req, res) => {
    const { tran_id } = req.params;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('transaction_id', sql.NVarChar, tran_id)
            .query("UPDATE sales SET status = 'Failed' WHERE transaction_id = @transaction_id");

        res.redirect('http://localhost:5173/shopowner/sales?status=failed');
    } catch (err) {
        console.error("Payment fail error:", err);
        res.redirect('http://localhost:5173/shopowner/sales?status=error');
    }
});

// GET /api/health
app.get('/api/health', async (req, res) => {
    try {
        const pool = await sql.connect();
        // Simple query to verify connection
        await pool.request().query('SELECT 1');
        res.json({ status: 'connected', message: 'Database connection is healthy' });
    } catch (err) {
        console.error("Health check failed:", err);
        res.status(500).json({ status: 'disconnected', message: 'Database connection failed' });
    }
});

// Repairs Routes

// GET /api/repairs
app.get('/api/repairs', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM repair_tickets ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching repair tickets:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/repairs
app.post('/api/repairs', async (req, res) => {
    const { customer_name, customer_phone, item_name, issue_description, estimated_cost, due_date } = req.body;

    try {
        const pool = await sql.connect();
        const ticketId = `R-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const insertQuery = `
            INSERT INTO repair_tickets (ticket_id, customer_name, customer_phone, item_name, issue_description, estimated_cost, delivery_date, status)
            OUTPUT INSERTED.*
            VALUES (@ticket_id, @customer_name, @customer_phone, @item_name, @issue_description, @estimated_cost, @delivery_date, 'Active')
        `;

        const result = await pool.request()
            .input('ticket_id', sql.NVarChar, ticketId)
            .input('customer_name', sql.NVarChar, customer_name)
            .input('customer_phone', sql.NVarChar, customer_phone || null)
            .input('item_name', sql.NVarChar, item_name)
            .input('issue_description', sql.NVarChar, issue_description)
            .input('estimated_cost', sql.Decimal(18, 2), estimated_cost || 0)
            .input('delivery_date', sql.DateTime, due_date || null) // Mapping due_date from frontend to delivery_date in DB
            .query(insertQuery);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error creating repair ticket:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/repairs/:id
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

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error updating repair ticket:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/repairs/:id
app.delete('/api/repairs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM repair_tickets WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        res.json({ message: "Ticket deleted successfully" });
    } catch (err) {
        console.error("Error deleting repair ticket:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

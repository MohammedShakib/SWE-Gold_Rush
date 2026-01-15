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
connectDB().then(async () => {
    try {
        const pool = await sql.connect();
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
                created_at DATETIME DEFAULT GETDATE()
            );
        `;
        await pool.request().query(createManufacturingTableQuery);
        console.log("Manufacturing table initialized");

        const createRepairsTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='repair_tickets' AND xtype='U')
            CREATE TABLE repair_tickets (
                id INT IDENTITY(1,1) PRIMARY KEY,
                ticket_id NVARCHAR(50) NOT NULL,
                customer_name NVARCHAR(255) NOT NULL,
                customer_phone NVARCHAR(50) NULL,
                item_name NVARCHAR(255) NOT NULL,
                issue_description NVARCHAR(MAX) NOT NULL,
                received_date DATETIME DEFAULT GETDATE(),
                delivery_date DATETIME NULL,
                status NVARCHAR(50) DEFAULT 'Active',
                estimated_cost DECIMAL(18, 2) DEFAULT 0,
                created_at DATETIME DEFAULT GETDATE()
            );
        `;
        await pool.request().query(createRepairsTableQuery);
        console.log("Repair Tickets table initialized");

        const createCustomersTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='customers' AND xtype='U')
            CREATE TABLE customers (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                phone NVARCHAR(50) NULL,
                type NVARCHAR(50) DEFAULT 'New',
                total_spent DECIMAL(18, 2) DEFAULT 0,
                last_visit DATETIME DEFAULT GETDATE(),
                created_at DATETIME DEFAULT GETDATE()
            );
        `;
        await pool.request().query(createCustomersTableQuery);
        console.log("Customers table initialized");
    } catch (err) {
        console.error("Schema initialization failed:", err);
    }
});

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
    const { fullName, phone, identifier, password, latitude, longitude } = req.body;
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    // Validate Input
    if (!fullName || !phone || !identifier || !password || !Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
        return res.status(400).json({ error: "All fields are required, including shop location" });
    }

    try {
        const pool = await sql.connect(); // Ensure we have a connection

        // Create table if not exists (T-SQL)
        const createTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
            CREATE TABLE users (
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
            IF COL_LENGTH('users', 'latitude') IS NULL
                ALTER TABLE users ADD latitude FLOAT NULL;
            IF COL_LENGTH('users', 'longitude') IS NULL
                ALTER TABLE users ADD longitude FLOAT NULL;
        `;
        await pool.request().query(addLocationColumnsQuery);

        // Check if user exists
        const checkUserQuery = 'SELECT * FROM users WHERE identifier = @identifier';
        const userExists = await pool.request()
            .input('identifier', sql.NVarChar, identifier)
            .query(checkUserQuery);

        if (userExists.recordset.length > 0) {
            return res.status(409).json({ error: "User already exists with this email/phone" });
        }

        // Insert new user
        const insertUserQuery = `
            INSERT INTO users (full_name, phone, identifier, password, latitude, longitude)
            OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.identifier
            VALUES (@fullName, @phone, @identifier, @password, @latitude, @longitude);
        `;

        const result = await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('phone', sql.NVarChar, phone)
            .input('identifier', sql.NVarChar, identifier)
            .input('password', sql.NVarChar, password)
            .input('latitude', sql.Float, parsedLatitude)
            .input('longitude', sql.Float, parsedLongitude)
            .query(insertUserQuery);

        const newUser = result.recordset[0];

        console.log("New User Registered:", newUser);

        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });

    } catch (err) {
        console.error("Error in signup:", err);
        res.status(500).json({ error: "Internal Server Error" });
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
        const checkUserQuery = 'SELECT * FROM users WHERE identifier = @identifier';
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
            INSERT INTO users (full_name, phone, identifier, password)
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
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/inventory
app.post('/api/inventory', async (req, res) => {
    const { name, category, karat, weight, price, stock_quantity, image_url, supplier_id, product_code } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: "Name and Price are required" });
    }

    try {
        const pool = await sql.connect();
        const insertQuery = `
            INSERT INTO products (name, category, karat, weight, price, stock_quantity, image_url, supplier_id, product_code)
            OUTPUT INSERTED.*
            VALUES (@name, @category, @karat, @weight, @price, @stock_quantity, @image_url, @supplier_id, @product_code)
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
            .input('product_code', sql.NVarChar, product_code || `P-${Date.now()}`) // Generate simpler code if missing
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
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT i.*, c.name as customer_name, c.phone as customer_phone
            FROM installments i
            LEFT JOIN customers c ON i.customer_id = c.id
            ORDER BY i.created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching installments:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/installments
app.post('/api/installments', async (req, res) => {
    const { customer_id, item_description, total_amount, paid_amount, due_date } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('customer_id', sql.Int, customer_id)
            .input('item_description', sql.NVarChar, item_description)
            .input('total_amount', sql.Decimal(18, 2), total_amount)
            .input('paid_amount', sql.Decimal(18, 2), paid_amount || 0)
            .input('due_date', sql.Date, due_date)
            .query(`
                INSERT INTO installments (customer_id, item_description, total_amount, paid_amount, due_date, status)
                VALUES (@customer_id, @item_description, @total_amount, @paid_amount, @due_date, 'Active')
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
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM customers');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/customers
app.post('/api/customers', async (req, res) => {
    const { name, phone, type, total_spent, last_visit } = req.body;
    try {
        const pool = await sql.connect();
        const insertQuery = `
            INSERT INTO customers (name, phone, type, total_spent, last_visit)
            OUTPUT INSERTED.*
            VALUES (@name, @phone, @type, @total_spent, @last_visit)
        `;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phone', sql.NVarChar, phone)
            .input('type', sql.NVarChar, type || 'New')
            .input('total_spent', sql.Decimal(18, 2), total_spent || 0)
            .input('last_visit', sql.DateTime, last_visit || new Date())
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
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT * FROM sales ORDER BY sale_date DESC
        `);
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
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    try {
        const total_amount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const tax_amount = total_amount * 0.05;
        const final_amount = total_amount + tax_amount;
        const tran_id = uuidv4();

        const pool = await sql.connect();

        // Insert Sale
        const saleInsert = await pool.request()
            .input('total_amount', sql.Decimal(18, 2), total_amount)
            .input('tax_amount', sql.Decimal(18, 2), tax_amount)
            .input('final_amount', sql.Decimal(18, 2), final_amount)
            .input('payment_method', sql.NVarChar, 'SSLCommerz')
            .input('transaction_id', sql.NVarChar, tran_id)
            .input('status', sql.NVarChar, 'Pending')
            .query(`
                INSERT INTO sales (total_amount, tax_amount, final_amount, payment_method, transaction_id, status)
                OUTPUT INSERTED.id
                VALUES (@total_amount, @tax_amount, @final_amount, @payment_method, @transaction_id, @status)
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

        // Init SSLCommerz
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
        await pool.request()
            .input('transaction_id', sql.NVarChar, tran_id)
            .query("UPDATE sales SET status = 'Completed' WHERE transaction_id = @transaction_id");

        res.redirect('http://localhost:5173/shopowner/sales?status=success');
    } catch (err) {
        console.error("Payment success error:", err);
        res.redirect('http://localhost:5173/shopowner/sales?status=error');
    }
});

// Manufacturing Routes

// GET /api/manufacturing
app.get('/api/manufacturing', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM manufacturing_orders ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching manufacturing orders:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/manufacturing
app.post('/api/manufacturing', async (req, res) => {
    const { order_id, customer_name, product_name, karigar_name, status, gold_weight, due_date } = req.body;

    try {
        const pool = await sql.connect();
        const insertQuery = `
            INSERT INTO manufacturing_orders (order_id, customer_name, product_name, karigar_name, status, gold_weight, due_date)
            OUTPUT INSERTED.*
            VALUES (@order_id, @customer_name, @product_name, @karigar_name, @status, @gold_weight, @due_date)
        `;

        const result = await pool.request()
            .input('order_id', sql.NVarChar, order_id)
            .input('customer_name', sql.NVarChar, customer_name)
            .input('product_name', sql.NVarChar, product_name)
            .input('karigar_name', sql.NVarChar, karigar_name || null)
            .input('status', sql.NVarChar, status || 'New Orders')
            .input('gold_weight', sql.Float, gold_weight || 0)
            .input('due_date', sql.DateTime, due_date || null)
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

// POST /api/branches
app.post('/api/branches', async (req, res) => {
    const { name, location } = req.body;
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('location', sql.NVarChar, location)
            .query(`
                INSERT INTO branches (name, location, status, daily_sales, stock_value)
                VALUES (@name, @location, 'Active', 0, '0')
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

// GET /api/stock-transfers
app.get('/api/stock-transfers', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM stock_transfers ORDER BY transfer_date DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching transfers:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/stock-transfers
app.post('/api/stock-transfers', async (req, res) => {
    const { from_branch, to_branch, items } = req.body;
    try {
        const transfer_id = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
        const pool = await sql.connect();

        await pool.request()
            .input('transfer_id', sql.NVarChar, transfer_id)
            .input('from_branch', sql.NVarChar, from_branch)
            .input('to_branch', sql.NVarChar, to_branch)
            .input('items', sql.NVarChar, items)
            .query(`
                INSERT INTO stock_transfers (transfer_id, from_branch, to_branch, items, transfer_date, status)
                VALUES (@transfer_id, @from_branch, @to_branch, @items, GETDATE(), 'Pending')
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

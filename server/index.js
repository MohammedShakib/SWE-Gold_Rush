const express = require('express');
const cors = require('cors');
const { sql, connectDB } = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

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
    const { fullName, phone, identifier, password } = req.body;

    // Validate Input
    if (!fullName || !phone || !identifier || !password) {
        return res.status(400).json({ error: "All fields are required" });
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
                created_at DATETIME DEFAULT GETDATE()
            );
        `;
        await pool.request().query(createTableQuery);

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
            INSERT INTO users (full_name, phone, identifier, password)
            OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.identifier
            VALUES (@fullName, @phone, @identifier, @password);
        `;

        const result = await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('phone', sql.NVarChar, phone)
            .input('identifier', sql.NVarChar, identifier)
            .input('password', sql.NVarChar, password)
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

// GET /api/inventory
app.get('/api/inventory', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM products');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching inventory:", err);
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

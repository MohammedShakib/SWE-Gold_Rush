require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function createTables() {
    try {
        const pool = await sql.connect(config);
        console.log("Connected to database. Creating tables...");

        // 1. users
        await pool.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
            CREATE TABLE users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                full_name NVARCHAR(255) NOT NULL,
                phone NVARCHAR(50),
                identifier NVARCHAR(255) UNIQUE NOT NULL,
                password NVARCHAR(255) NOT NULL,
                latitude FLOAT,
                longitude FLOAT,
                created_at DATETIME DEFAULT getdate()
            );
        `);
        console.log("Checked/Created table: users");

        // 2. GL_OrderItems
        await pool.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_OrderItems' AND xtype='U')
            CREATE TABLE GL_OrderItems (
                id INT IDENTITY(1,1) PRIMARY KEY,
                order_id INT FOREIGN KEY REFERENCES GL_Orders(id),
                product_id INT,
                quantity INT,
                price_at_purchase DECIMAL(18, 2),
                making_charge DECIMAL(18, 2)
            );
        `);
        console.log("Checked/Created table: GL_OrderItems");

        // 3. GL_Cart
        await pool.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_Cart' AND xtype='U')
            CREATE TABLE GL_Cart (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT FOREIGN KEY REFERENCES GL_Users(id),
                product_id INT,
                quantity INT
            );
        `);
        console.log("Checked/Created table: GL_Cart");

        // 4. GL_Reviews
        await pool.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_Reviews' AND xtype='U')
            CREATE TABLE GL_Reviews (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT FOREIGN KEY REFERENCES GL_Users(id),
                product_id INT,
                rating INT,
                comment NVARCHAR(MAX),
                image_url NVARCHAR(MAX)
            );
        `);
        console.log("Checked/Created table: GL_Reviews");

        console.log("All tables processed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating tables:", err);
        process.exit(1);
    }
}

createTables();

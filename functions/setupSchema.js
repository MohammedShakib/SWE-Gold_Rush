require('dotenv').config();
const { sql, connectDB } = require('./db');

const setupSchema = async () => {
    try {
        await connectDB();

        // 1. GL_Users
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_Users' and xtype='U')
            CREATE TABLE GL_Users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                full_name NVARCHAR(255),
                phone NVARCHAR(50) UNIQUE NOT NULL,
                password_hash NVARCHAR(255),
                address NVARCHAR(MAX),
                created_at DATETIME DEFAULT GETDATE()
            )
        `);
        console.log('✅ GL_Users table created');

        // 2. GL_ShopProfiles
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_ShopProfiles' and xtype='U')
            CREATE TABLE GL_ShopProfiles (
                id INT IDENTITY(1,1) PRIMARY KEY,
                shopowner_id INT,
                shop_slug NVARCHAR(255) UNIQUE,
                logo_url NVARCHAR(MAX),
                banner_url NVARCHAR(MAX),
                rating DECIMAL(3, 2),
                is_verified BIT DEFAULT 0,
                FOREIGN KEY (shopowner_id) REFERENCES shopowners(id)
            )
        `);
        console.log('✅ GL_ShopProfiles table created');

        // 3. GL_Orders
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_Orders' and xtype='U')
            CREATE TABLE GL_Orders (
                id INT IDENTITY(1,1) PRIMARY KEY,
                order_number NVARCHAR(50) UNIQUE,
                user_id INT,
                shopowner_id INT,
                total_amount DECIMAL(18, 2),
                payment_status NVARCHAR(50),
                order_status NVARCHAR(50),
                delivery_address NVARCHAR(MAX),
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES GL_Users(id),
                FOREIGN KEY (shopowner_id) REFERENCES shopowners(id)
            )
        `);
        console.log('✅ GL_Orders table created');

        // 4. GL_OrderItems
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_OrderItems' and xtype='U')
            CREATE TABLE GL_OrderItems (
                id INT IDENTITY(1,1) PRIMARY KEY,
                order_id INT,
                product_id INT,
                quantity INT,
                price_at_purchase DECIMAL(18, 2),
                making_charge DECIMAL(18, 2),
                FOREIGN KEY (order_id) REFERENCES GL_Orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        console.log('✅ GL_OrderItems table created');

        // 5. GL_Cart
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_Cart' and xtype='U')
            CREATE TABLE GL_Cart (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT,
                product_id INT,
                quantity INT,
                FOREIGN KEY (user_id) REFERENCES GL_Users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        console.log('✅ GL_Cart table created');

        // 6. GL_Reviews
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GL_Reviews' and xtype='U')
            CREATE TABLE GL_Reviews (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT,
                product_id INT,
                rating INT,
                comment NVARCHAR(MAX),
                image_url NVARCHAR(MAX),
                FOREIGN KEY (user_id) REFERENCES GL_Users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        console.log('✅ GL_Reviews table created');

        console.log('🎉 Gold Lagbe Schema Setup Complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Schema setup failed:', err);
        process.exit(1);
    }
};

setupSchema();

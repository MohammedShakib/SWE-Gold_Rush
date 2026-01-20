const sql = require('mssql');
require('dotenv').config();
// Verify we are using the correct credentials.
// We expect .env in current folder or parent to have HOST/USER/PASS.
// We will override DB_NAME to 'gold_lagbe_main' for the primary connection.

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: 'gold_lagbe_main', // Force connect to the new DB
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const setupAndMigrate = async () => {
    try {
        console.log("Connecting to [gold_lagbe_main]...");
        await sql.connect(config);

        // --- PART 1: SCHEMA SETUP (from setupSchema.js) ---
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
                is_verified BIT DEFAULT 0
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
                FOREIGN KEY (user_id) REFERENCES GL_Users(id)
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
                FOREIGN KEY (order_id) REFERENCES GL_Orders(id)
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
                FOREIGN KEY (user_id) REFERENCES GL_Users(id)
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
                FOREIGN KEY (user_id) REFERENCES GL_Users(id)
            )
        `);
        console.log('✅ GL_Reviews table created');

        // --- PART 2: MIGRATION ---
        console.log("Starting Data Migration...");
        const tables = ['GL_Users', 'GL_ShopProfiles', 'GL_Orders', 'GL_OrderItems', 'GL_Cart', 'GL_Reviews'];

        for (const table of tables) {
            // Check source
            const checkQuery = `SELECT COUNT(*) as count FROM [gold_rush_main].[dbo].[${table}]`;
            try {
                const res = await sql.query(checkQuery);
                const count = res.recordset[0].count;

                if (count > 0) {
                    // Check if Destination is empty to avoid duplicates if run multiple times
                    const checkDest = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
                    if (checkDest.recordset[0].count === 0) {
                        console.log(`Migrating ${count} rows for ${table}...`);
                        await sql.query(`SET IDENTITY_INSERT ${table} ON`);

                        const colsRes = await sql.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' AND COLUMN_NAME != 'sys_row_id'`);
                        const columns = colsRes.recordset.map(r => r.COLUMN_NAME).join(', ');

                        await sql.query(`
                            INSERT INTO ${table} (${columns})
                            SELECT ${columns}
                            FROM [gold_rush_main].[dbo].[${table}]
                         `);

                        await sql.query(`SET IDENTITY_INSERT ${table} OFF`);
                    } else {
                        console.log(`Destination ${table} already has data. Skipping insert.`);
                    }
                }

                // Drop Source
                console.log(`Dropping [gold_rush_main].[dbo].[${table}]...`);
                await sql.query(`DROP TABLE [gold_rush_main].[dbo].[${table}]`);
                console.log(`Dropped old ${table}.`);

            } catch (ignore) {
                // Check if table missing error (208)
                if (ignore.code !== 'EREQUEST' && !ignore.message.includes('Invalid object name')) {
                    console.error(`Error with ${table}:`, ignore.message);
                } else {
                    console.log(`Table [gold_rush_main].[dbo].[${table}] likely does not exist or already dropped.`);
                }
            }
        }

        console.log("Migration Complete.");
        process.exit(0);

    } catch (err) {
        console.error("Setup Failed:", err);
        process.exit(1);
    }
};

setupAndMigrate();

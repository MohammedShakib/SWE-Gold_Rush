const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: 'gold_rush_main', // Connect to Source DB to create trigger on it
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const createTrigger = async () => {
    try {
        console.log("Connecting to [gold_rush_main]...");
        await sql.connect(config);

        console.log("Creating Trigger 'trg_AutoCreateGLProfile'...");

        // Drop if exists to avoid error
        await sql.query(`
            IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_AutoCreateGLProfile')
            DROP TRIGGER trg_AutoCreateGLProfile
        `);

        // Create Trigger
        // Note: Using dynamic SQL for the trigger body to ensure it's created correctly
        const triggerQuery = `
            CREATE TRIGGER trg_AutoCreateGLProfile
            ON shopowners
            AFTER INSERT
            AS
            BEGIN
                SET NOCOUNT ON;

                INSERT INTO [gold_lagbe_main].[dbo].[GL_ShopProfiles] 
                       (shopowner_id, shop_slug, logo_url, banner_url, rating, is_verified)
                SELECT 
                    i.id, 
                    -- Generate Slug: lowercase, space to hyphen, append ID for uniqueness
                    LOWER(REPLACE(ISNULL(i.shop_name, 'shop'), ' ', '-')) + '-' + CAST(i.id AS NVARCHAR(50)),
                    'https://placehold.co/200',
                    'https://placehold.co/800x200',
                    5.0,
                    1
                FROM inserted i;
            END
        `;

        await sql.query(triggerQuery);
        console.log("✅ Trigger created successfully.");
        console.log("Any new shop registering in Gold Rush will now automatically appear in Gold Lagbe.");

        process.exit(0);

    } catch (err) {
        console.error("Trigger Creation Failed:", err);
        process.exit(1);
    }
};

createTrigger();

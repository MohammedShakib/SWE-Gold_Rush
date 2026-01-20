const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: 'gold_lagbe_main',
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

const populateShops = async () => {
    try {
        console.log("Connecting to [gold_lagbe_main]...");
        await sql.connect(config);

        console.log("Fetching shopowners...");
        // 'shopowners' is a synonym, so this works
        const result = await sql.query('SELECT id, shop_name FROM shopowners');
        const owners = result.recordset;

        console.log(`Found ${owners.length} shop owners.`);

        for (const owner of owners) {
            const { id, shop_name } = owner;
            const name = shop_name || `Shop-${id}`;
            const slug = slugify(name) + '-' + id; // Append ID to ensure uniqueness

            // Check if exists
            const check = await sql.query`SELECT id FROM GL_ShopProfiles WHERE shopowner_id = ${id}`;
            if (check.recordset.length === 0) {
                console.log(`Creating profile for ${name}...`);
                await sql.query`
                    INSERT INTO GL_ShopProfiles (shopowner_id, shop_slug, logo_url, banner_url, rating, is_verified)
                    VALUES (${id}, ${slug}, 'https://placehold.co/200', 'https://placehold.co/800x200', 5.0, 1)
                `;
            } else {
                console.log(`Profile for ${name} already exists.`);
            }
        }

        console.log("Population Complete.");
        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

populateShops();

const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: 'gold_lagbe_main', // Connect to Gold Lagbe DB
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const createSynonyms = async () => {
    try {
        console.log("Connecting to [gold_lagbe_main]...");
        await sql.connect(config);

        // List of tables that reside in Gold Rush but are needed in Gold Lagbe
        const tables = ['products', 'shopowners', 'branches', 'sales', 'manufacturing_orders', 'repair_tickets', 'installments'];
        // Add others if needed. User mentioned 'products' and 'shopowners' specifically in schema FKs.
        // Let's add the ones typically shared or referenced.

        for (const table of tables) {
            try {
                // Check if synonym exists
                const check = await sql.query(`SELECT * FROM sys.synonyms WHERE name = '${table}'`);
                if (check.recordset.length === 0) {
                    // Check if table exists (local table taking precedence?)
                    const checkTable = await sql.query(`SELECT * FROM sys.tables WHERE name = '${table}'`);
                    if (checkTable.recordset.length === 0) {
                        console.log(`Creating synonym for ${table}...`);
                        await sql.query(`CREATE SYNONYM [dbo].[${table}] FOR [gold_rush_main].[dbo].[${table}]`);
                        console.log(`✅ Synonym created: ${table} -> [gold_rush_main].[dbo].[${table}]`);
                    } else {
                        console.log(`⚠️ Table ${table} already exists locally. Skipping synonym.`);
                    }
                } else {
                    console.log(`Synonym ${table} already exists.`);
                }
            } catch (err) {
                console.error(`Error creating synonym for ${table}:`, err.message);
            }
        }

        console.log("Synonym Creation Complete.");
        process.exit(0);

    } catch (err) {
        console.error("Connection Failed:", err);
        process.exit(1);
    }
};

createSynonyms();

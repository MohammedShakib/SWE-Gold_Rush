const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function fixSchema() {
    try {
        await sql.connect(config);
        const pool = new sql.Request();

        console.log("Attempting to add shopowner_id...");
        try {
            await pool.query("ALTER TABLE stock_transfers ADD shopowner_id NVARCHAR(50)");
            console.log("Success: Added shopowner_id");
        } catch (e) {
            console.log("Info: shopowner_id likely exists or error: " + e.message);
        }

        console.log("Attempting to add user_id...");
        try {
            await pool.query("ALTER TABLE stock_transfers ADD user_id INT");
            console.log("Success: Added user_id");
        } catch (e) {
            console.log("Info: user_id likely exists or error: " + e.message);
        }

        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

fixSchema();

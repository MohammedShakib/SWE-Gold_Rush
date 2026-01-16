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

async function updateSchema() {
    try {
        const pool = await sql.connect(config);

        // Check if shopowner_id exists in stock_transfers
        const checkCol = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stock_transfers' AND COLUMN_NAME = 'shopowner_id'");

        if (checkCol.recordset.length === 0) {
            console.log('Adding shopowner_id to stock_transfers...');
            await pool.request().query("ALTER TABLE stock_transfers ADD shopowner_id NVARCHAR(50)");
        } else {
            console.log('shopowner_id already exists in stock_transfers.');
        }

        // Check if user_id exists
        const checkUserCol = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'stock_transfers' AND COLUMN_NAME = 'user_id'");
        if (checkUserCol.recordset.length === 0) {
            console.log('Adding user_id to stock_transfers...');
            await pool.request().query("ALTER TABLE stock_transfers ADD user_id INT");
        } else {
            console.log('user_id already exists in stock_transfers.');
        }

        console.log("Schema update completed.");

    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}
updateSchema();

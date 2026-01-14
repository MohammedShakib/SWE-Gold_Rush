const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

const testQuery = async () => {
    try {
        await sql.connect(config);
        console.log("Connected to DB. Executing query...");

        const result = await sql.query('SELECT * FROM manufacturing_orders');
        console.log("Query Success! Rows:", result.recordset.length);
        console.log(result.recordset);

        process.exit(0);
    } catch (err) {
        console.error("Query Failed!");
        console.error(err);
        process.exit(1);
    }
};

testQuery();

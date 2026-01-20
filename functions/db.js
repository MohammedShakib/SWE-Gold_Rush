const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true // Change to true for local dev / if certificate is self-signed
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log(`✅ Connected to Google Cloud SQL (MSSQL) at ${config.server}`);
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
};

module.exports = { sql, connectDB };

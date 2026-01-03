const sql = require('mssql');
require('dotenv').config();

const connectDB = async () => {
    try {
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
        console.log("DB Config Sanitized:", { ...config, password: '***' });

        await sql.connect(config);
        console.log(`Connected to SQL Server at ${process.env.DB_HOST}`);
    } catch (err) {
        console.error('Database Connection Failed:', err);
        throw err; // Re-throw so index.js catches it
    }
};

module.exports = {
    sql,
    connectDB
};

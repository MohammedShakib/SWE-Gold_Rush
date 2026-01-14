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

console.log("Testing DB Connection with config:");
console.log({
    ...config,
    password: config.password ? '****' : 'UNDEFINED'
});

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log(`SUCCESS: Connected to SQL Server at ${process.env.DB_HOST}`);
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Database Connection Failed:', err);
        process.exit(1);
    }
};

connectDB();

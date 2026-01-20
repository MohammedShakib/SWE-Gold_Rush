const sql = require('mssql');
require('dotenv').config({ path: './.env' });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: 'master', // Connect to master to create new DB
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function createDatabase() {
    try {
        console.log("Connecting to SQL Server (master)...");
        await sql.connect(config);

        console.log("Creating database 'gold_lagbe_main'...");
        // Check if database exists
        const result = await sql.query(`SELECT name FROM sys.databases WHERE name = 'gold_lagbe_main'`);

        if (result.recordset.length === 0) {
            await sql.query(`CREATE DATABASE gold_lagbe_main`);
            console.log("Database 'gold_lagbe_main' created successfully.");
        } else {
            console.log("Database 'gold_lagbe_main' already exists.");
        }

        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating database:", err);
        process.exit(1);
    }
}

createDatabase();

const { sql, connectDB } = require('./db');

async function checkData() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log("Checking first product:");
        const result = await pool.request().query("SELECT TOP 1 * FROM products");
        console.log(result.recordset[0]);

        console.log("Checking if branch column exists:");
        const colCheck = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'branch'");
        console.log(colCheck.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();

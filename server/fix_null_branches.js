const { sql, connectDB } = require('./db');

async function checkAndFix() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log("Checking Products with NULL branch:");
        const checkResult = await pool.request().query("SELECT COUNT(*) as count FROM products WHERE branch IS NULL");
        console.log("Null Rows:", checkResult.recordset[0].count);

        if (checkResult.recordset[0].count > 0) {
            console.log("Fixing NULL branches...");
            await pool.request().query("UPDATE products SET branch = 'Main Branch' WHERE branch IS NULL");
            console.log("Fixed products.");
        }

        // Check verification
        const verifyResult = await pool.request().query("SELECT branch, COUNT(*) as count FROM products GROUP BY branch");
        console.table(verifyResult.recordset);

        // Also fix other tables just in case
        const tables = ['sales', 'manufacturing_orders', 'repair_tickets', 'customers', 'users', 'installments'];
        for (const table of tables) {
            await pool.request().query(`UPDATE ${table} SET branch = 'Main Branch' WHERE branch IS NULL`);
            console.log(`Fixed ${table} (if any were null)`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAndFix();

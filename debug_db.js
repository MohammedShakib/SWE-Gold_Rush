const { sql, connectDB } = require('./server/db');

async function checkData() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log("Checking Products per Branch:");
        const result = await pool.request().query("SELECT branch, COUNT(*) as count, STRING_AGG(name, ', ') as items FROM products GROUP BY branch");
        console.table(result.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();

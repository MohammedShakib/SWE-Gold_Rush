const { sql, connectDB } = require('./db');
async function checkSchema() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log("--- Sales Table Schema ---");
        const sales = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sales'");
        console.log(sales.recordset.map(c => c.COLUMN_NAME));

        console.log("--- Repair Tickets Schema ---");
        const repairs = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'repair_tickets'");
        console.log(repairs.recordset.map(c => c.COLUMN_NAME));

        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}
checkSchema();

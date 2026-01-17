const { sql, connectDB } = require('./db');
async function checkSchema() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log("--- Manufacturing Orders Schema ---");
        const man = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'manufacturing_orders'");
        console.log(man.recordset.map(c => c.COLUMN_NAME));

        console.log("--- Installments Schema ---");
        const inst = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'installments'");
        console.log(inst.recordset.map(c => c.COLUMN_NAME));

        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}
checkSchema();

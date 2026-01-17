const { sql, connectDB } = require('./db');

async function checkCounts() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log("Manufacturing per Branch:");
        const mfg = await pool.request().query("SELECT branch, COUNT(*) as c FROM manufacturing_orders GROUP BY branch");
        console.table(mfg.recordset);

        console.log("Installments per Branch:");
        const inst = await pool.request().query("SELECT branch, COUNT(*) as c FROM installments GROUP BY branch");
        console.table(inst.recordset);

        console.log("Repairs per Branch:");
        const rep = await pool.request().query("SELECT branch, COUNT(*) as c FROM repair_tickets GROUP BY branch");
        console.table(rep.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkCounts();

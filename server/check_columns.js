const { sql, connectDB } = require('./db');
connectDB().then(async () => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'branches'");
        console.log("Columns:", result.recordset.map(row => row.COLUMN_NAME));
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
});

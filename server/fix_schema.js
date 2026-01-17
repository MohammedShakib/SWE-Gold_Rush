const { sql, connectDB } = require('./db');
connectDB().then(async () => {
    try {
        const pool = await sql.connect();

        console.log("Attempting to add shopowner_id to branches...");
        try {
            await pool.request().query("ALTER TABLE branches ADD shopowner_id NVARCHAR(50) NULL");
            console.log("SUCCESS: Column added.");
        } catch (err) {
            console.log("INFO: Column might already exist or error occurred:", err.message);
        }

        console.log("Updating branches...");
        const result = await pool.request().query(`
            UPDATE b
            SET b.shopowner_id = u.shopowner_id
            FROM branches b
            INNER JOIN users u ON b.user_id = u.id
            WHERE b.shopowner_id IS NULL OR b.shopowner_id != u.shopowner_id;
        `);
        console.log("SUCCESS: Rows affected:", result.rowsAffected);

        console.log("Verifying columns...");
        const cols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'branches'");
        console.log("Current Columns:", cols.recordset.map(r => r.COLUMN_NAME));

    } catch (err) {
        console.error("FATAL ERROR:", err);
    }
    process.exit(0);
});

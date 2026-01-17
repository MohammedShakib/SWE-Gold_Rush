const { sql, connectDB } = require('./db');
connectDB().then(async () => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query("SELECT id, full_name, identifier, shopowner_id FROM shopowners");
        console.table(result.recordset);

        const branches = await pool.request().query("SELECT id, name, user_id, shopowner_id FROM branches");
        console.table(branches.recordset);
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
});

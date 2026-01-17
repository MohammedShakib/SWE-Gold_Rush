const { sql, connectDB } = require('./db');
connectDB().then(async () => {
    try {
        const pool = await sql.connect();
        const users = await pool.request().query("SELECT id, full_name, identifier, shopowner_id FROM shopowners");
        console.log("USERS:", JSON.stringify(users.recordset, null, 2));

        const branches = await pool.request().query("SELECT id, name, user_id, shopowner_id FROM branches");
        console.log("BRANCHES:", JSON.stringify(branches.recordset, null, 2));
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
});

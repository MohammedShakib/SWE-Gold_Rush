const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sql, connectDB } = require('./db');

async function checkUser() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log("Checking for user 'sami@gmail.com'...");
        const result = await pool.request()
            .input('identifier', sql.NVarChar, 'sami@gmail.com')
            .query("SELECT * FROM shopowners WHERE identifier = @identifier");

        if (result.recordset.length > 0) {
            console.log("User Found:", result.recordset[0]);
        } else {
            console.log("User 'sami@gmail.com' NOT FOUND.");
        }

        console.log("\n--- Top 5 Most Recent Users ---");
        const recent = await pool.request().query("SELECT TOP 5 id, full_name, identifier, created_at FROM shopowners ORDER BY created_at DESC");
        console.table(recent.recordset);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

checkUser();

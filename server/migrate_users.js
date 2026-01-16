const { sql, connectDB } = require('./db');

async function migrateData() {
    try {
        await connectDB();
        const tables = ['sales', 'products', 'customers', 'installments', 'manufacturing_orders', 'repair_tickets', 'stock_transfers'];

        for (const table of tables) {
            console.log(`Migrating ${table}...`);
            // Check if user_id exists? We assume yes.
            // Update shopowner_id from shopowners table via user_id
            const query = `
                UPDATE t
                SET t.shopowner_id = s.shopowner_id
                FROM ${table} t
                JOIN shopowners s ON t.user_id = s.id
                WHERE t.shopowner_id IS NULL
            `;
            try {
                const result = await sql.query(query);
                console.log(`Updated ${result.rowsAffected[0]} rows in ${table}.`);
            } catch (qErr) {
                console.error(`Failed to migrate ${table}:`, qErr.message);
                // Might fail if column doesn't exist? But we checked.
            }
        }
    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        await sql.close();
    }
}

migrateData();

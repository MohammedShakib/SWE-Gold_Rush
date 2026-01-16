const { sql, connectDB } = require('./db');

// No manual config needed, connectDB handles it


async function checkColumns() {
    try {
        await connectDB();
        // Wait for connection to be ready if connectDB matches index.js pattern, 
        // or assumes connectDB resolves when connected.
        // Index.js does: connectDB().then(async () => { const pool = await sql.connect(); ... })
        // If connectDB returns a promise that resolves when connected, then we might not need sql.connect() again?
        // Let's assume standard index.js pattern:
        // await connectDB(); 
        const pool = await sql.connect(); // Re-establish or get pool? 
        // Actually, if connectDB already connects, sql.globalConnection might be set.
        // Let's just try:
        // await connectDB(); 
        const tables = ['sales', 'products', 'customers', 'installments', 'manufacturing_orders', 'repair_tickets', 'stock_transfers'];


        for (const table of tables) {
            console.log(`\n--- TABLE: ${table} ---`);
            const result = await sql.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}'
            `);
            const columns = result.recordset.map(row => row.COLUMN_NAME);
            console.log(columns.join(', '));

            if (columns.includes('user_id')) console.log(`[!] Has user_id`);
            if (columns.includes('shopowner_id')) console.log(`[OK] Has shopowner_id`);
            else console.log(`[X] MISSING shopowner_id`);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sql.close();
    }
}

checkColumns();

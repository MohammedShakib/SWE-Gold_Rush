const { sql, connectDB } = require('./db');
async function checkComputed() {
    try {
        await connectDB();
        const pool = await sql.connect();

        const query = `
            SELECT COLUMN_NAME, COLUMNPROPERTY(object_id('installments'), COLUMN_NAME, 'IsComputed') as IsComputed
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'installments'
        `;
        const res = await pool.request().query(query);
        console.log(JSON.stringify(res.recordset, null, 2));
        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}
checkComputed();

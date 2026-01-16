const { sql, connectDB } = require('./db');
async function checkIdentity() {
    try {
        await connectDB();
        const pool = await sql.connect();

        const query = `
            SELECT TABLE_NAME, COLUMN_NAME, COLUMNPROPERTY(object_id(TABLE_SCHEMA+'.'+TABLE_NAME), COLUMN_NAME, 'IsIdentity') as IsIdentity
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('customers', 'sales') AND COLUMN_NAME = 'id'
        `;
        const res = await pool.request().query(query);
        console.log(JSON.stringify(res.recordset, null, 2));
        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}
checkIdentity();

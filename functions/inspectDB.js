require('dotenv').config();
const { sql, connectDB } = require('./db');

const inspect = async () => {
    try {
        await connectDB();

        // Get columns for shopowners
        const result = await sql.query`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'shopowners'
        `;

        console.log('Columns in shopowners table:');
        result.recordset.forEach(row => console.log(row.COLUMN_NAME));

        process.exit(0);
    } catch (err) {
        console.error('Inspection failed:', err);
        process.exit(1);
    }
};

inspect();

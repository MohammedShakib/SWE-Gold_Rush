const { sql, connectDB } = require('./db');

const checkData = async () => {
    try {
        console.log("Connecting...");
        await connectDB();
        const pool = await sql.connect();

        console.log("Checking Customers...");
        const customers = await pool.request().query('SELECT * FROM customers');
        console.log(`Count: ${customers.recordset.length}`);
        console.log(customers.recordset);

        console.log("Checking Products...");
        const products = await pool.request().query('SELECT * FROM products');
        console.log(`Count: ${products.recordset.length}`);
        console.log(products.recordset);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkData();

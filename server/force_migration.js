const { sql, connectDB } = require('./db');

async function migrate() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log("Starting Manual Migration...");

        // 1. Add Branch Column to all tables
        const tables = [
            'products', 'sales', 'manufacturing_orders', 'repair_tickets',
            'customers', 'users', 'installments'
        ];

        for (const table of tables) {
            try {
                const checkColumnQuery = `
                    IF COL_LENGTH('${table}', 'branch') IS NULL
                    BEGIN
                        ALTER TABLE ${table} ADD branch NVARCHAR(255) DEFAULT 'Main Branch';
                        PRINT 'Added branch column to ${table}';
                    END
                    ELSE
                    BEGIN
                        PRINT 'Branch column already exists in ${table}';
                    END
                `;
                await pool.request().query(checkColumnQuery);
            } catch (e) {
                console.error(`Failed to alter table ${table}:`, e.message);
            }
        }

        // 3. Seed Demo Data for Chittagong
        try {
            const checkDemoQuery = "SELECT COUNT(*) as count FROM products WHERE branch = 'Chittagong Branch'";
            const demoResult = await pool.request().query(checkDemoQuery);

            if (demoResult.recordset[0].count === 0) {
                console.log("Seeding demo data for Chittagong Branch...");

                // Products - Include product_code!
                const seedQuery = `
                    INSERT INTO products (name, category, karat, weight, price, stock_quantity, image_url, branch, status, product_code)
                    VALUES 
                    ('Chittagong Gold Necklace', 'Necklace', '22K', 12.5, 120000, 5, 'https://placehold.co/400', 'Chittagong Branch', 'In Stock', 'P-CTG-001'),
                    ('Agrabad Special Ring', 'Ring', '21K', 5.0, 45000, 10, 'https://placehold.co/400', 'Chittagong Branch', 'In Stock', 'P-CTG-002'),
                    ('Lalkhan Bazaar Earring', 'Earring', '21K', 3.5, 35000, 8, 'https://placehold.co/400', 'Chittagong Branch', 'In Stock', 'P-CTG-003');
                `;
                await pool.request().query(seedQuery);
                console.log("Products seeded.");

                // Repairs
                await pool.request().query(`
                    INSERT INTO repair_tickets (ticket_id, customer_name, customer_phone, item_name, issue_description, estimated_cost, branch, status)
                    VALUES 
                    ('REP-CTG-001', 'Karim Ullah', '01812345678', 'Broken Chain', 'Soldering needed', 500, 'Chittagong Branch', 'Active');
                `);

                // Sales
                await pool.request().query(`
                    INSERT INTO sales (total_amount, tax_amount, final_amount, payment_method, transaction_id, status, branch)
                    VALUES 
                    (120000, 6000, 126000, 'Cash', 'TXN-CTG-101', 'Completed', 'Chittagong Branch');
                `);

            } else {
                console.log("Chittagong Data already exists (or branch col just added and row count 0 checked).");
            }
        } catch (e) {
            console.error("Seeding failed:", e.message);
        }

        console.log("Migration Complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration Failed:", err);
        process.exit(1);
    }
}

migrate();

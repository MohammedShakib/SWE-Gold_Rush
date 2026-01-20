require('dotenv').config();
const { sql, connectDB } = require('./db');

const checkAndSeed = async () => {
    try {
        await connectDB();

        // Check if shopowners exist
        const result = await sql.query`SELECT * FROM shopowners`;
        console.log(`Found ${result.recordset.length} shopowners.`);

        // Seed if empty
        if (result.recordset.length === 0) {
            console.log('No shopowners found. Seeding basic shopowners...');
            try {
                await sql.query`
                    INSERT INTO shopowners (shop_name, full_name, phone, password, branch)
                    VALUES 
                    ('Amin Jewellers', 'Amin Owner', '01700000001', 'hash1', 'Bashundhara City'),
                    ('Diamond World', 'Diamond Owner', '01700000002', 'hash2', 'Gulshan 1'),
                    ('Apan Jewellers', 'Apan Owner', '01700000003', 'hash3', 'Uttara'),
                    ('Sultana Gems', 'Sultana Owner', '01700000004', 'hash4', 'Dhanmondi')
                `;
                console.log('Inserted 4 dummy shopowners.');
            } catch (seedErr) {
                console.error('Initial seeding failed:', seedErr.message);
            }
        }

        // Now link GL_ShopProfiles
        const owners = await sql.query`SELECT * FROM shopowners`;

        for (const owner of owners.recordset) {
            try {
                console.log('Processing owner:', owner.id, owner.shop_name);

                // Check if profile exists
                const profileCheck = await sql.query`SELECT * FROM GL_ShopProfiles WHERE shopowner_id = ${owner.id}`;

                if (profileCheck.recordset.length === 0) {
                    const slug = owner.shop_name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    const rating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);

                    const logoUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(owner.shop_name) + '&background=random';

                    await sql.query`
                        INSERT INTO GL_ShopProfiles (shopowner_id, shop_slug, logo_url, banner_url, rating, is_verified)
                        VALUES (
                            ${owner.id}, 
                            ${slug}, 
                            ${logoUrl}, 
                            'https://images.unsplash.com/photo-1610375461490-fb4133a2f00b?w=1200&auto=format&fit=crop&q=60',
                            ${rating},
                            1
                        )
                    `;
                    console.log(`Created profile for ${owner.shop_name}`);
                } else {
                    console.log(`Profile already exists for ${owner.shop_name}`);
                }
            } catch (innerErr) {
                console.error(`Failed for owner ${owner.shop_name}:`, innerErr.message);
            }
        }

        console.log('✅ Seeding complete.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

checkAndSeed();

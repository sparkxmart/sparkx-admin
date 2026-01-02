
import pg from 'pg';
const { Client } = pg;

// Connection string from Kottster config
const connectionString = 'postgresql://neondb_owner:npg_D9eUICtoT5gl@ep-little-resonance-afho8bbs-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function verifyProducts() {
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Connected to Database');

        const res = await client.query('SELECT name, brand, weight, "skinType", "isHidden", "comparePrice", tags FROM "Product" LIMIT 5');

        console.log(JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error('❌ Database connection error:', err);
    } finally {
        await client.end();
    }
}

verifyProducts();

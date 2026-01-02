
import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

// Connection string from Kottster config
const connectionString = 'postgresql://neondb_owner:npg_D9eUICtoT5gl@ep-little-resonance-afho8bbs-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function importProducts() {
    const filePath = path.join(process.cwd(), 'notInDB.json');

    if (!fs.existsSync(filePath)) {
        console.error('❌ Error: products.json not found in the root directory.');
        console.log('👉 Please create a "products.json" file with an array of products.');
        process.exit(1);
    }

    console.log('📖 Reading products.json...');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    let products;

    try {
        products = JSON.parse(rawData);
        if (!Array.isArray(products)) {
            throw new Error('Root element is not an array');
        }
    } catch (e) {
        console.error('❌ Error parsing JSON:', (e as Error).message);
        process.exit(1);
    }

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('✅ Connected to Database');

        let successCount = 0;
        let errorCount = 0;

        for (const p of products) {
            try {
                // Ensure required fields
                const slug = p.slug || p.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(7);
                const stock = p.stock || 50;
                const isActive = p.isActive !== undefined ? p.isActive : true;
                const isHidden = p.isHidden !== undefined ? p.isHidden : false;

                // Normalizing keys
                const brand = p.brand || null;
                const weight = p.weight || p.Weight || null;
                const size = p.size || p.Size || null;
                const skinType = p.skinType || p["skin type"] || p["Skin Type"] || null;
                const tags = p.tags || [];
                const comparePrice = p.comparePrice || 0;

                await client.query(
                    `INSERT INTO "Product" (
                        "id", "name", "slug", "description", "basePrice", "categories", "stock", "isActive", "images", "createdAt", "updatedAt",
                        "brand", "weight", "size", "skinType", "tags", "comparePrice", "isHidden"
                    )
                    VALUES (
                        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(),
                        $9, $10, $11, $12, $13, $14, $15
                    )
                    ON CONFLICT ("slug") DO UPDATE SET
                        "name" = EXCLUDED."name",
                        "description" = EXCLUDED."description",
                        "basePrice" = EXCLUDED."basePrice",
                        "categories" = EXCLUDED."categories",
                        "stock" = EXCLUDED."stock",
                        "isActive" = EXCLUDED."isActive",
                        "images" = EXCLUDED."images",
                        "updatedAt" = NOW(),
                        "brand" = EXCLUDED."brand",
                        "weight" = EXCLUDED."weight",
                        "size" = EXCLUDED."size",
                        "skinType" = EXCLUDED."skinType",
                        "tags" = EXCLUDED."tags",
                        "comparePrice" = EXCLUDED."comparePrice",
                        "isHidden" = EXCLUDED."isHidden"`,
                    [
                        p.name,
                        slug,
                        p.description || '',
                        p.basePrice || p.price || 0,
                        p.categories || [],
                        stock,
                        isActive,
                        p.images || [],
                        brand,
                        weight,
                        size,
                        skinType,
                        tags,
                        comparePrice,
                        isHidden
                    ]
                );
                successCount++;
                process.stdout.write('.');
            } catch (err) {
                console.error(`\n❌ Failed to insert "${p.name}":`, (err as Error).message);
                errorCount++;
            }
        }

        console.log(`\n\n🎉 Import Complete!`);
        console.log(`✅ Success: ${successCount}`);
        console.log(`⚠️ Skipped/Failed: ${errorCount}`);

    } catch (err) {
        console.error('❌ Database connection error:', err);
    } finally {
        await client.end();
    }
}

importProducts();

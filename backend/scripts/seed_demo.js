
import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from '../db.js';
import Product from '../models/Product.js';
import { MOCK_PRODUCTS_DATA } from '../data/seedData.js';

const seedDemoOnly = async () => {
    try {
        await connectDB();
        
        // Filter for products that start with [DEMO]
        const demoProducts = MOCK_PRODUCTS_DATA.filter(p => p.name.startsWith('[DEMO]'));
        
        console.log(`Found ${demoProducts.length} demo products to seed.`);
        
        for (const demoP of demoProducts) {
            const exists = await Product.findOne({ productId: String(demoP.id) });
            if (!exists) {
                const { id, ...rest } = demoP;
                await Product.create({
                    ...rest,
                    productId: String(id)
                });
                console.log(`Successfully seeded: ${demoP.name}`);
            } else {
                console.log(`Skipped (already exists): ${demoP.name}`);
            }
        }
        
        console.log('Demo seeding operation complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding demo products:', error);
        process.exit(1);
    }
};

seedDemoOnly();

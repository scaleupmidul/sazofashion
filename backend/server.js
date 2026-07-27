
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './db.js';
import Product from './models/Product.js';
import Settings from './models/Settings.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import messageRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';
import trackingRoutes from './routes/tracking.js';

import { MOCK_PRODUCTS_DATA, DEFAULT_SETTINGS_DATA } from './data/seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set('trust proxy', 1);

app.use(compression());
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Request logger for debugging
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        console.log(`[API Request] ${req.method} ${req.url}`);
    }
    next();
});

const initializeDatabase = async () => {
    try {
        console.log('[DB] Checking initialization...');
        
        // Parallelize initial counts to save network round trips
        const [settingsCount, productCount] = await Promise.all([
            Settings.countDocuments(),
            Product.countDocuments()
        ]);
        
        const seedTasks = [];

        if (settingsCount === 0) {
            console.log('[DB] Seeding default settings...');
            const seedSettings = async () => {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(DEFAULT_SETTINGS_DATA.adminPassword, salt);
                await Settings.create({ ...DEFAULT_SETTINGS_DATA, adminPassword: hashedPassword, adminPasswordPlain: DEFAULT_SETTINGS_DATA.adminPassword });
            };
            seedTasks.push(seedSettings());
        } else {
            // Minimal migration: Just ensure an admin email exists and plain password is backfilled
            const migrateSettings = async () => {
                const settings = await Settings.findOne();
                if (settings) {
                    let updated = false;
                    if (!settings.adminEmail) {
                        console.log('[DB] Seeding default admin email to admin@sazo.com');
                        settings.adminEmail = 'admin@sazo.com';
                        const salt = await bcrypt.genSalt(10);
                        settings.adminPassword = await bcrypt.hash('sazo_admin_2026', salt);
                        settings.adminPasswordPlain = 'sazo_admin_2026';
                        updated = true;
                    } else if (!settings.adminPasswordPlain) {
                        console.log('[DB] Backfilling adminPasswordPlain field');
                        settings.adminPasswordPlain = 'sazo_admin_2026';
                        updated = true;
                    }
                    if (updated) {
                        await settings.save();
                    }
                }
            };
            seedTasks.push(migrateSettings());
        }

        if (productCount === 0) {
            console.log('[DB] Seeding initial products...');
            const productsToSeed = MOCK_PRODUCTS_DATA.map(({ id, ...rest }) => ({
                ...rest,
                productId: String(id) 
            }));
            seedTasks.push(Product.insertMany(productsToSeed));
        }

        // Wait for primary seeding to finish
        await Promise.all(seedTasks);

        // Offload heavy/slow cleanup task asynchronously in the background so it never blocks startup/requests
        cleanupUnsplashImagesBackground().catch(err => {
            console.error('[DB Background Cleanup Error]:', err);
        });

        console.log('[DB] Core initialization complete.');
    } catch (error) {
        console.error('[DB] Critical initialization error:', error);
    }
};

const cleanupUnsplashImagesBackground = async () => {
    try {
        console.log('[DB] Running background cleanup for default/demo Unsplash images...');
        
        // HIGH PERFORMANCE optimization: 1 query bulk update instead of slow, sequential row saves!
        const result = await Product.updateMany(
            { images: { $regex: /unsplash\.com/i } },
            { $set: { images: [] } }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`[DB] Cleared Unsplash images for ${result.modifiedCount} products in 1 quick database query.`);
        }

        const currentSettings = await Settings.findOne();
        if (currentSettings) {
            let updatedSettings = false;
            if (currentSettings.sliderImages && currentSettings.sliderImages.some(img => img.image && img.image.includes('unsplash.com'))) {
                currentSettings.sliderImages = currentSettings.sliderImages.map(img => ({
                    ...img.toObject(),
                    image: '',
                    mobileImage: ''
                }));
                updatedSettings = true;
            }
            if (currentSettings.signatureBanners && currentSettings.signatureBanners.some(banner => banner.desktopImage && banner.desktopImage.includes('unsplash.com'))) {
                currentSettings.signatureBanners = currentSettings.signatureBanners.map(banner => ({
                    ...banner.toObject(),
                    desktopImage: '',
                    mobileImage: ''
                }));
                updatedSettings = true;
            }
            if (currentSettings.categoryImages && currentSettings.categoryImages.some(img => img.image && img.image.includes('unsplash.com'))) {
                currentSettings.categoryImages = currentSettings.categoryImages.map(img => ({
                    ...img.toObject(),
                    image: ''
                }));
                updatedSettings = true;
            }
            if (updatedSettings) {
                console.log('[DB] Clearing Unsplash images in settings');
                await currentSettings.save();
            }
        }
        console.log('[DB] Background Unsplash cleanup finished.');
    } catch (err) {
        console.error('[DB Cleanup Error] Error during background Unsplash cleanup:', err);
    }
};

// Start database connection and core seeding proactively on server startup
let initializationPromise = null;
const startDBWarmup = async () => {
    try {
        const conn = await connectDB();
        if (conn && !initializationPromise) {
            initializationPromise = initializeDatabase();
            await initializationPromise;
        }
    } catch (err) {
        console.error('[DB Warmup Error] Failed to warm up DB on server start:', err.message);
    }
};
startDBWarmup();

const dbConnectionMiddleware = async (req, res, next) => {
    try {
        const conn = await connectDB();
        req.dbConnected = !!conn;
        next();
    } catch (error) {
        console.error('[Middleware] DB error:', error.message);
        req.dbConnected = false;
        next();
    }
};

app.use('/api', dbConnectionMiddleware);

// Health check ALWAYS available
app.get('/api/health', (req, res) => {
    try {
        res.json({ 
            status: 'ok', 
            db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            dbState: mongoose.connection.readyState,
            env: {
                hasMongoUri: !!(process.env.MONGO_URI || process.env.MONGODB_URI),
                nodeEnv: process.env.NODE_ENV,
                isVercel: !!process.env.VERCEL
            },
            time: new Date().toISOString() 
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/page-data/home', async (req, res) => {
    try {
        let products = [];
        let settings = DEFAULT_SETTINGS_DATA;

        if (req.dbConnected) {
            const settingsDoc = await Settings.findOne().select('-adminPassword').lean();
            if (settingsDoc) settings = settingsDoc;

            products = await Product.find(
                { $or: [{ isNewArrival: true }, { isTrending: true }] },
                { images: { $slice: 1 }, description: 0, colors: 0, sizes: 0 }
            )
            .sort({ isTrending: -1, isNewArrival: -1 })
            .limit(12)
            .lean();
        }

        // Fallback to mock products if DB is empty or disconnected
        if (products.length === 0) {
            console.log('[API] Using mock data fallback for home page');
            products = MOCK_PRODUCTS_DATA.filter(p => p.isNewArrival || p.isTrending).slice(0, 12);
        }

        const formattedProducts = products.map(p => ({
            ...p,
            id: p._id ? p._id.toString() : String(p.id)
        }));

        res.json({ settings, products: formattedProducts });
    } catch (error) {
        console.error('[API] Home error:', error);
        res.status(500).json({ message: 'Server Error', fallback: true });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/track', trackingRoutes);

// Only start server-side logic (Vite or static server) if NOT on Vercel
// Vercel will handle static files and direct routes herself.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const startDevServer = async () => {
        try {
            const { createServer: createViteServer } = await import('vite');
            const vite = await createViteServer({
                server: { middlewareMode: true },
                appType: 'spa',
                root: path.join(__dirname, '..')
            });
            app.use(vite.middlewares);
            listen();
        } catch (err) {
            console.error('Failed to load Vite:', err);
            listen();
        }
    };
    startDevServer();
} else if (!process.env.VERCEL) {
    // In production on non-vercel environments, serve dist
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath, { 
        maxAge: '1d',
        etag: true
    }));

    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
    
    listen();
}

function listen() {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

export default app;

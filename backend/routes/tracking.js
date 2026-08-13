
import express from 'express';
import mongoose from 'mongoose';
import { trackGA4Event, trackMetaCAPI } from '../utils/tracking.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// In-memory cache for settings with 30s TTL
let cachedSettings = null;
let lastSettingsFetch = 0;

const getCachedSettings = async () => {
    const now = Date.now();
    if (cachedSettings && (now - lastSettingsFetch) < 30000 && cachedSettings.fbAccessToken) {
        return cachedSettings;
    }
    if (mongoose.connection.readyState === 1) {
        try {
            const fetched = await Settings.findOne().lean();
            if (fetched) {
                cachedSettings = fetched;
                lastSettingsFetch = now;
            }
        } catch (e) {
            console.warn('[Tracking Route] Settings fetch error:', e.message);
        }
    }
    return cachedSettings;
};

router.post('/event', async (req, res) => {
    try {
        const { eventName, params = {}, userData = {}, gaClientId, pixelId } = req.body;
        const settings = await getCachedSettings();

        // Immediate 200 response to prevent client hang
        res.status(200).json({ status: 'sent' });

        // 1. GA4 Tracking
        const effectiveGaId = settings?.gaMeasurementId || process.env.GA4_MEASUREMENT_ID;
        const effectiveGaSecret = settings?.gaApiSecret || process.env.GA4_API_SECRET;
        if (effectiveGaId && effectiveGaSecret) {
            trackGA4Event(eventName, params, gaClientId, {
                gaMeasurementId: effectiveGaId,
                gaApiSecret: effectiveGaSecret
            }).catch(e => console.log("GA4 Error:", e.message));
        }

        // 2. Meta CAPI
        const cookieFbc = req.cookies?._fbc || req.cookies?.fbc || null;
        const cookieFbp = req.cookies?._fbp || req.cookies?.fbp || null;
        const cookieTestCode = req.cookies?.fb_test_code || null;
        const userAgent = req.headers['user-agent'] || userData?.userAgent || '';
        const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || req.ip;

        const effectiveFbc = userData?.fbc || cookieFbc || null;
        const effectiveFbp = userData?.fbp || cookieFbp || null;
        const effectiveExternalId = gaClientId || userData?.external_id || null;
        const testCode = (
            req.body.test_event_code || 
            params?.test_event_code || 
            req.query?.test_event_code || 
            cookieTestCode || 
            settings?.fbTestCode || 
            process.env.FB_TEST_CODE || 
            ''
        ).trim();

        const effectivePixelId = (settings?.fbPixelId || pixelId || process.env.FB_PIXEL_ID || '').trim();
        const effectiveAccessToken = (settings?.fbAccessToken || process.env.FB_ACCESS_TOKEN || '').trim();

        trackMetaCAPI(eventName, params, {
            ...userData,
            external_id: effectiveExternalId,
            ip,
            userAgent,
            fbc: effectiveFbc,
            fbp: effectiveFbp
        }, {
            fbPixelId: effectivePixelId,
            fbAccessToken: effectiveAccessToken,
            fbTestCode: testCode || undefined
        }).catch(e => console.log("Meta CAPI Error:", e.message));

    } catch (error) {
        console.error('[Tracking Route] Error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

export default router;

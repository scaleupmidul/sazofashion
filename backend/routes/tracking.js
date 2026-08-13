
import express from 'express';
import { trackGA4Event, trackMetaCAPI } from '../utils/tracking.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// In-memory cache for settings with 30s TTL
let cachedSettings = null;
let lastSettingsFetch = 0;

const getCachedSettings = async (dbConnected) => {
    const now = Date.now();
    if (cachedSettings && (now - lastSettingsFetch) < 30000) {
        return cachedSettings;
    }
    if (dbConnected) {
        try {
            cachedSettings = await Settings.findOne().lean();
            lastSettingsFetch = now;
        } catch (e) {
            console.warn('[Tracking Route] Settings fetch error:', e.message);
        }
    }
    return cachedSettings;
};

router.post('/event', async (req, res) => {
    try {
        const { eventName, params = {}, userData = {}, gaClientId } = req.body;
        const settings = await getCachedSettings(req.dbConnected);

        // Immediate 200 response to prevent client hang
        res.status(200).json({ status: 'sent' });

        // 1. GA4 Tracking
        trackGA4Event(eventName, params, gaClientId, {
            gaMeasurementId: settings?.gaMeasurementId,
            gaApiSecret: settings?.gaApiSecret
        }).catch(e => console.log("GA4 Error:", e.message));

        // 2. Meta CAPI
        const cookieFbc = req.cookies?._fbc || req.cookies?.fbc || null;
        const cookieFbp = req.cookies?._fbp || req.cookies?.fbp || null;
        const userAgent = req.headers['user-agent'];
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const effectiveFbc = userData?.fbc || cookieFbc || null;
        const effectiveFbp = userData?.fbp || cookieFbp || null;
        const testCode = (req.body.test_event_code || params?.test_event_code || settings?.fbTestCode || '').trim();

        trackMetaCAPI(eventName, params, {
            ...userData,
            external_id: gaClientId || userData?.external_id,
            ip,
            userAgent,
            fbc: effectiveFbc,
            fbp: effectiveFbp
        }, {
            fbPixelId: settings?.fbPixelId,
            fbAccessToken: settings?.fbAccessToken,
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

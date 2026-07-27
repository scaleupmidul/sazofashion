
import express from 'express';
import { trackGA4Event, trackMetaCAPI } from '../utils/tracking.js';
import Settings from '../models/Settings.js';

const router = express.Router();

router.post('/event', async (req, res) => {
    try {
        const { eventName, params, userData, gaClientId } = req.body;
        let settings = null;
        if (req.dbConnected) {
            settings = await Settings.findOne();
        }

        // 1. GA4 Tracking
        trackGA4Event(eventName, params, gaClientId, {
            gaMeasurementId: settings?.gaMeasurementId,
            gaApiSecret: settings?.gaApiSecret
        }).catch(e => console.log("GA4 Error:", e.message));

        // 2. Meta CAPI
        const fbc = req.cookies?._fbc || req.cookies?.fbc || null;
        const fbp = req.cookies?._fbp || req.cookies?.fbp || null;
        const userAgent = req.headers['user-agent'];
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        trackMetaCAPI(eventName, params, {
            ...userData,
            external_id: gaClientId,
            ip,
            userAgent,
            fbc,
            fbp
        }, {
            fbPixelId: settings?.fbPixelId,
            fbAccessToken: settings?.fbAccessToken,
            fbTestCode: settings?.fbTestCode
        }).catch(e => console.log("Meta CAPI Error:", e.message));

        res.status(200).json({ status: 'sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

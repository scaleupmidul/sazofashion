
import axios from 'axios';
import crypto from 'crypto';

/**
 * Helper to hash PII data for Meta (SHA256)
 */
const hashData = (data) => {
    if (!data || typeof data !== 'string') return null;
    const cleaned = data.trim().toLowerCase();
    if (!cleaned) return null;
    return crypto.createHash('sha256').update(cleaned).digest('hex');
};

/**
 * Normalize phone numbers to international E.164 format digits for Meta (e.g., 88017XXXXXXXX)
 */
const normalizePhone = (phone) => {
    if (!phone) return null;
    let digits = String(phone).replace(/\D/g, '');
    if (!digits) return null;
    // For Bangladesh numbers starting with 01
    if (digits.startsWith('01') && digits.length === 11) {
        digits = '88' + digits;
    } else if (digits.startsWith('8801') && digits.length === 13) {
        // already has 88
    } else if (digits.length === 10 && digits.startsWith('1')) {
        digits = '880' + digits;
    }
    return hashData(digits);
};

/**
 * Normalize 2-letter ISO Country code (e.g., 'bd')
 */
const normalizeCountry = (country) => {
    if (!country) return hashData('bd');
    const lower = String(country).trim().toLowerCase();
    if (lower === 'bangladesh' || lower === 'bd' || lower === 'bgd') {
        return hashData('bd');
    }
    if (lower.length === 2) {
        return hashData(lower);
    }
    return hashData('bd');
};

/**
 * Meta Conversions API (CAPI) Integration
 */
export const trackMetaCAPI = async (eventName, params, userData = {}, config = {}) => {
    const pixel_id = config.fbPixelId || process.env.FB_PIXEL_ID;
    const access_token = config.fbAccessToken || process.env.FB_ACCESS_TOKEN;

    if (!pixel_id || !access_token) {
        console.warn('Meta CAPI skipped: Missing credentials');
        return;
    }

    const url = `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${access_token}`;

    const rawEmail = userData.email || userData.user_data?.email;
    const rawPhone = userData.phone || userData.user_data?.phone_number || userData.phone_number;
    const rawFirstName = userData.firstName || userData.first_name || userData.user_data?.address?.first_name;
    const rawLastName = userData.lastName || userData.last_name;
    const rawCity = userData.city || userData.user_data?.address?.city;
    const rawState = userData.state || userData.user_data?.address?.state;
    const rawZip = userData.zip || userData.postal_code || userData.user_data?.address?.postal_code;
    const rawCountry = userData.country || userData.user_data?.address?.country;
    const rawExternalId = userData.external_id || userData.gaClientId || userData.id;

    // Filter array to only include non-null hashes
    const wrapHash = (val) => {
        const hashed = typeof val === 'string' && val.length === 64 ? val : hashData(val);
        return hashed ? [hashed] : undefined;
    };

    const hashedPhone = normalizePhone(rawPhone);
    const hashedCountry = normalizeCountry(rawCountry);

    const user_data = {
        client_ip_address: userData.ip || null,
        client_user_agent: userData.userAgent || null,
        fbc: userData.fbc || params['x-fb-ck-fbc'] || null,
        fbp: userData.fbp || params['x-fb-ck-fbp'] || null,
    };

    if (rawEmail) user_data.em = wrapHash(rawEmail);
    if (hashedPhone) user_data.ph = [hashedPhone];
    if (rawFirstName) user_data.fn = wrapHash(rawFirstName);
    if (rawLastName) user_data.ln = wrapHash(rawLastName);
    if (rawCity) user_data.ct = wrapHash(rawCity);
    if (rawState) user_data.st = wrapHash(rawState);
    if (rawZip) user_data.zp = wrapHash(rawZip);
    if (hashedCountry) user_data.country = [hashedCountry];
    if (rawExternalId) user_data.external_id = wrapHash(rawExternalId);

    const payload = {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_id: params.event_id || params.transaction_id || `evt_${Date.now()}`,
            event_source_url: params.event_source_url || '',
            user_data,
            custom_data: {
                currency: params.currency || 'BDT',
                value: typeof params.value !== 'undefined' ? Number(params.value) : 0,
                content_ids: params.content_ids || (params.items ? params.items.map(i => String(i.id || i.sku || i.productId)) : []),
                content_type: params.content_type || 'product',
                content_name: params.content_name || params['x-fb-cd-content_name'] || '',
                content_category: params.content_category || '',
                num_items: params.num_items || (params.contents ? params.contents.reduce((acc, c) => acc + (Number(c.quantity) || 1), 0) : 1),
                shipping: params.shipping || 0,
                contents: params.contents || (params.items ? params.items.map(item => ({
                    id: String(item.id || item.sku || item.productId),
                    quantity: Number(item.quantity || 1),
                    item_price: Number(item.price || item.item_price || 0)
                })) : [])
            }
        }],
        ...(config.fbTestCode && String(config.fbTestCode).trim() ? { test_event_code: String(config.fbTestCode).trim() } : {})
    };

    if (config.fbTestCode && String(config.fbTestCode).trim()) {
        console.log(`🔍 Meta CAPI Debug: ${eventName} (ID: ${payload.data[0].event_id}) using Test Code: ${config.fbTestCode}`);
    }

    try {
        const response = await axios.post(url, payload);
        console.log(`✅ Meta CAPI Sent: ${eventName}. ID: ${payload.data[0].event_id}. Status: ${response.status}`);
    } catch (error) {
        console.error('❌ Meta CAPI Failed:', error.response?.data || error.message);
    }
};

/**
 * GA4 Measurement Protocol Integration
 */
export const trackGA4Event = async (eventName, params, clientId, config = {}) => {
    const measurement_id = config.gaMeasurementId || process.env.GA4_MEASUREMENT_ID;
    const api_secret = config.gaApiSecret || process.env.GA4_API_SECRET;

    if (!measurement_id || !api_secret) {
        console.warn('GA4 Tracking skipped: Missing G-ID or API Secret in Settings');
        return;
    }

    // Use the eventName directly to match the Meta schema (PascalCase) as requested
    const gaEventName = eventName;

    // Default Client ID if not provided (Fallback)
    const effectiveClientId = clientId || `client_${Date.now()}`;

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`;

    // Standardize items for GA4
    let gaItems = [];
    
    if (params.items && Array.isArray(params.items)) {
        gaItems = params.items.map(item => ({
            item_id: String(item.item_id || item.id || ''),
            item_name: String(item.item_name || item.name || 'Product'),
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            item_variant: String(item.item_variant || item.variant || ''),
            item_category: String(item.item_category || item.category || '')
        }));
    } else if (params.content_ids && Array.isArray(params.content_ids)) {
        gaItems = params.content_ids.map(id => ({
            item_id: String(id),
            item_name: String(params.content_name || 'Product'),
            currency: String(params.currency || 'BDT'),
            price: Number(params.value || 0) / (params.num_items || 1),
            quantity: Number(params.num_items || 1)
        }));
    }

    const payload = {
        client_id: effectiveClientId,
        events: [{
            name: gaEventName,
            params: {
                currency: params.currency || 'BDT',
                value: Number(params.value || 0),
                transaction_id: params.transaction_id ? String(params.transaction_id) : undefined,
                shipping: params.shipping ? Number(params.shipping) : undefined,
                items: gaItems,
                debug_mode: true,
                engagement_time_msec: '100',
            }
        }]
    };

    try {
        await axios.post(url, payload);
        console.log(`✅ GA4 Server-Side Event Sent: ${gaEventName} (Original: ${eventName})`);
    } catch (error) {
        console.error('❌ GA4 Tracking Error:', error.response?.data || error.message);
    }
};

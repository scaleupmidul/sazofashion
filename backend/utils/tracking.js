
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

const sanitizeIp = (rawIp) => {
    if (!rawIp || typeof rawIp !== 'string') return null;
    let ip = rawIp.split(',')[0].trim();
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || !ip) {
        return null;
    }
    return ip;
};

/**
 * Meta Conversions API (CAPI) Integration
 */
export const trackMetaCAPI = async (eventName, params = {}, userData = {}, config = {}) => {
    const pixel_id = (config.fbPixelId || process.env.FB_PIXEL_ID || '').trim();
    const access_token = (config.fbAccessToken || process.env.FB_ACCESS_TOKEN || '').trim();

    if (!pixel_id || !access_token) {
        console.warn(`[Meta CAPI] Skipped ${eventName}: Missing Pixel ID or Access Token`);
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
        if (!val || typeof val !== 'string') return undefined;
        const cleaned = val.trim();
        if (!cleaned) return undefined;
        const hashed = cleaned.length === 64 && /^[0-9a-f]{64}$/i.test(cleaned) ? cleaned.toLowerCase() : hashData(cleaned);
        return hashed ? [hashed] : undefined;
    };

    const hashedPhone = normalizePhone(rawPhone);
    const hashedCountry = normalizeCountry(rawCountry);

    const user_data = {};
    const cleanIp = sanitizeIp(userData.ip);
    if (cleanIp) user_data.client_ip_address = cleanIp;

    if (userData.userAgent && typeof userData.userAgent === 'string' && userData.userAgent.trim()) {
        user_data.client_user_agent = userData.userAgent.trim();
    }

    const effectiveFbc = userData.fbc || params['x-fb-ck-fbc'] || null;
    const effectiveFbp = userData.fbp || params['x-fb-ck-fbp'] || null;
    if (effectiveFbc && typeof effectiveFbc === 'string' && effectiveFbc.trim()) {
        user_data.fbc = effectiveFbc.trim();
    }
    if (effectiveFbp && typeof effectiveFbp === 'string' && effectiveFbp.trim()) {
        user_data.fbp = effectiveFbp.trim();
    }

    if (rawEmail) user_data.em = wrapHash(rawEmail);
    if (hashedPhone) user_data.ph = [hashedPhone];
    if (rawFirstName) user_data.fn = wrapHash(rawFirstName);
    if (rawLastName) user_data.ln = wrapHash(rawLastName);
    if (rawCity) user_data.ct = wrapHash(rawCity);
    if (rawState) user_data.st = wrapHash(rawState);
    if (rawZip) user_data.zp = wrapHash(rawZip);
    if (hashedCountry) user_data.country = [hashedCountry];
    if (rawExternalId) user_data.external_id = wrapHash(rawExternalId);

    // Build custom_data based on event type
    const custom_data = {};
    const isEcomEvent = ['Purchase', 'AddToCart', 'ViewContent', 'InitiateCheckout'].includes(eventName);

    if (isEcomEvent) {
        custom_data.currency = (params.currency || 'BDT').toUpperCase();
        if (typeof params.value !== 'undefined' && params.value !== null && !isNaN(Number(params.value))) {
            custom_data.value = parseFloat(Number(params.value).toFixed(2));
        }
        custom_data.content_type = params.content_type || 'product';
        if (params.content_name) custom_data.content_name = String(params.content_name);
        if (params.content_category) custom_data.content_category = String(params.content_category);

        // Normalize contents array
        let normalizedContents = [];
        if (params.contents && Array.isArray(params.contents) && params.contents.length > 0) {
            normalizedContents = params.contents.map(item => {
                const itemId = String(item.id || item.productId || item.item_id || '').trim();
                const itemPrice = typeof item.item_price !== 'undefined' ? Number(item.item_price) : (typeof item.price !== 'undefined' ? Number(item.price) : 0);
                const itemQty = parseInt(item.quantity, 10) || 1;
                return {
                    id: itemId,
                    quantity: Math.max(1, itemQty),
                    item_price: isNaN(itemPrice) ? 0 : parseFloat(itemPrice.toFixed(2))
                };
            }).filter(i => !!i.id);
        } else if (params.items && Array.isArray(params.items) && params.items.length > 0) {
            normalizedContents = params.items.map(item => {
                const itemId = String(item.item_id || item.id || item.productId || '').trim();
                const itemPrice = typeof item.price !== 'undefined' ? Number(item.price) : (typeof item.item_price !== 'undefined' ? Number(item.item_price) : 0);
                const itemQty = parseInt(item.quantity, 10) || 1;
                return {
                    id: itemId,
                    quantity: Math.max(1, itemQty),
                    item_price: isNaN(itemPrice) ? 0 : parseFloat(itemPrice.toFixed(2))
                };
            }).filter(i => !!i.id);
        }

        if (normalizedContents.length > 0) {
            custom_data.contents = normalizedContents;
            custom_data.content_ids = normalizedContents.map(c => c.id);
        } else if (params.content_ids && Array.isArray(params.content_ids) && params.content_ids.length > 0) {
            custom_data.content_ids = params.content_ids.map(id => String(id).trim()).filter(Boolean);
        }

        if (params.num_items && !isNaN(Number(params.num_items))) {
            custom_data.num_items = Math.max(1, parseInt(params.num_items, 10));
        } else if (custom_data.contents && custom_data.contents.length > 0) {
            custom_data.num_items = custom_data.contents.reduce((acc, c) => acc + (c.quantity || 1), 0);
        }

        if (eventName === 'Purchase') {
            if (params.order_id || params.transaction_id) {
                custom_data.order_id = String(params.order_id || params.transaction_id);
            }
            if (typeof params.shipping !== 'undefined' && params.shipping !== null && !isNaN(Number(params.shipping))) {
                custom_data.shipping = parseFloat(Number(params.shipping).toFixed(2));
            }
        }
    } else if (eventName === 'Search' && params.search_string) {
        custom_data.search_string = String(params.search_string);
    } else if (eventName === 'ViewCategory' && params.content_category) {
        custom_data.content_category = String(params.content_category);
    }

    const sourceUrl = (params.event_source_url || params.url || userData.url || 'https://www.sazobd.shop/').trim();
    const eventId = String(params.event_id || params.transaction_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

    const effectiveTestCode = (config.fbTestCode && String(config.fbTestCode).trim()) || undefined;

    const payload = {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_id: eventId,
            event_source_url: sourceUrl,
            user_data,
            ...(Object.keys(custom_data).length > 0 ? { custom_data } : {})
        }],
        ...(effectiveTestCode ? { test_event_code: effectiveTestCode } : {})
    };

    try {
        const response = await axios.post(url, payload, { timeout: 8000 });
        console.log(`✅ [Meta CAPI] Event Sent: ${eventName} | EventID: ${eventId} | Status: ${response.status}${effectiveTestCode ? ` | TestCode: ${effectiveTestCode}` : ''}`);
    } catch (error) {
        const errorData = error.response?.data?.error || error.response?.data || error.message;
        console.error(`❌ [Meta CAPI Failed] ${eventName} | EventID: ${eventId} | Error:`, JSON.stringify(errorData));
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


import axios from 'axios';
import crypto from 'crypto';

/**
 * Helper to hash PII data for Meta (SHA256)
 */
const hashData = (data) => {
    if (!data) return null;
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

/**
 * Meta Conversions API (CAPI) Integration
 */
export const trackMetaCAPI = async (eventName, params, userData, config = {}) => {
    const pixel_id = config.fbPixelId || process.env.FB_PIXEL_ID;
    const access_token = config.fbAccessToken || process.env.FB_ACCESS_TOKEN;

    if (!pixel_id || !access_token) {
        console.warn('Meta CAPI skipped: Missing credentials');
        return;
    }

    const url = `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${access_token}`;

    const payload = {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_id: params.event_id || params.transaction_id || `evt_${Date.now()}`,
            event_source_url: params.event_source_url || '',
            user_data: {
                em: [hashData(userData.email || userData.user_data?.email)],
                ph: [hashData(userData.phone || userData.user_data?.phone_number)],
                fn: [hashData(userData.firstName || userData.user_data?.address?.first_name)],
                ln: [hashData(userData.lastName)],
                ct: [hashData(userData.city || userData.user_data?.address?.city)],
                st: [hashData(userData.state)],
                db: [hashData(userData.dateOfBirth)],
                ge: [hashData(userData.gender)],
                country: [hashData(userData.country || userData.user_data?.address?.country || 'Bangladesh')],
                client_ip_address: userData.ip || null,
                client_user_agent: userData.userAgent || null,
                fbc: userData.fbc || params['x-fb-ck-fbc'] || null,
                fbp: userData.fbp || params['x-fb-ck-fbp'] || null,
                external_id: [hashData(userData.external_id || userData.gaClientId)]
            },
            custom_data: {
                currency: params.currency || 'BDT',
                value: params.value || 0,
                content_ids: params.content_ids || params.items?.map(i => i.id || i.sku) || [],
                content_type: params.content_type || 'product',
                content_name: params.content_name || params['x-fb-cd-content_name'] || '',
                num_items: params.num_items || params['x-fb-cd-num_items'] || 1,
                shipping: params.shipping || 0,
                contents: params.items ? params.items.map(item => ({
                    id: item.id || item.sku,
                    quantity: item.quantity,
                    price: item.price
                })) : []
            }
        }],
        test_event_code: config.fbTestCode || null
    };

    if (config.fbTestCode) {
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

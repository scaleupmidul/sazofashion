
/**
 * Universal Server-Side Tracker
 * Sends event data to our backend proxy to forward to GA4 and Meta CAPI
 */
export const trackServerEvent = async (eventName: string, params: any = {}, userData: any = {}) => {
    try {
        // 1. Generate a clean unique event ID
        const eventId = params.event_id || `${Date.now()}.${Math.floor(Math.random() * 1000000)}`;
        
        // 2. Helper to get cookies
        const getCookie = (name: string) => {
            if (typeof document === 'undefined') return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        // 3. Push to dataLayer for GTM to pick up (Deduplication Sync)
        if (typeof window !== 'undefined') {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
                event: 'server_event_sync',
                event_id: eventId,
                tracking_event_name: eventName
            });
        }

        // 4. Get GA and FB IDs
        let gaClientId = localStorage.getItem('ga_client_id');
        if (!gaClientId) {
            const match = document.cookie.match(/_ga=(?:GA1\.\d+\.)?(\d+\.\d+)/);
            gaClientId = match ? match[1] : `client_${Date.now()}`;
        }

        const fbp = getCookie('_fbp');
        const fbc = getCookie('_fbc');

        // 5. Enhance user data with cookies and browser info
        const enhancedUserData = {
            ...userData,
            fbp,
            fbc,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            userAgent_client: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            ip: '', // Backend will fill this from headers
            external_id: userData.external_id || gaClientId,
        };

        // 6. Prepare parameters with shared event_id
        const enrichedParams = {
            ...params,
            event_id: eventId,
            event_source_url: typeof window !== 'undefined' ? window.location.href : '',
            page_location: typeof window !== 'undefined' ? window.location.href : '',
            page_referrer: typeof document !== 'undefined' ? document.referrer : '',
            action_source: 'website',
            'x-fb-ck-fbp': fbp,
            'x-fb-ck-fbc': fbc,
            first_party_collection: true,
            'x-fb-cd-content_type': params.content_type || 'product',
            'x-fb-cd-num_items': params.num_items || (params.items ? params.items.length : 1),
            event_time: Math.floor(Date.now() / 1000),
        };

        const body = {
            eventName,
            params: enrichedParams,
            userData: enhancedUserData,
            gaClientId
        };

        const response = await fetch('/api/track/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server tracking failed:', errorData);
        }
    } catch (error) {
        console.warn('Tracking error ignored:', error);
    }
};

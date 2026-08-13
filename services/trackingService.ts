import axios from 'axios';
import { Product } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    gtag?: (...args: any[]) => void;
  }
}

let initializedPixelId: string | null = null;
let initializedGa4Id: string | null = null;
let initializedGtmId: string | null = null;

let activeFbTestCode: string = '';

export const getActiveTestEventCode = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    // 1. Check URL parameters (?test_event_code=TEST... or ?test_code=... or ?fb_test_code=...)
    const urlParams = new URLSearchParams(window.location.search);
    const urlTestCode = urlParams.get('test_event_code') || urlParams.get('test_code') || urlParams.get('fb_test_code');
    if (urlTestCode && urlTestCode.trim()) {
      const cleaned = urlTestCode.trim();
      sessionStorage.setItem('fb_test_code', cleaned);
      localStorage.setItem('fb_test_code', cleaned);
      document.cookie = `fb_test_code=${cleaned};path=/;max-age=86400;SameSite=Lax`;
      activeFbTestCode = cleaned;
      return cleaned;
    }

    // 2. Check storage
    const sessionCode = sessionStorage.getItem('fb_test_code');
    if (sessionCode && sessionCode.trim()) {
      activeFbTestCode = sessionCode.trim();
      return activeFbTestCode;
    }

    const localCode = localStorage.getItem('fb_test_code');
    if (localCode && localCode.trim()) {
      activeFbTestCode = localCode.trim();
      return activeFbTestCode;
    }

    // 3. Check cookie
    const cookieCode = getCookie('fb_test_code');
    if (cookieCode && cookieCode.trim()) {
      activeFbTestCode = cookieCode.trim();
      return activeFbTestCode;
    }

    // 4. Check initialized settings test code
    if (activeFbTestCode && activeFbTestCode.trim()) {
      return activeFbTestCode.trim();
    }
  } catch (e) {}
  return undefined;
};

// Extract and preserve Click ID (fbc) with full Facebook standard formatting
export const getOrCreateFbc = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. Check existing cookie
  let fbc = getCookie('_fbc') || getCookie('fbc');
  if (fbc && fbc.startsWith('fb.1.')) return fbc;

  // 2. Check localStorage / sessionStorage
  try {
    const stored = localStorage.getItem('_fbc') || sessionStorage.getItem('_fbc');
    if (stored && stored.startsWith('fb.1.')) {
      fbc = stored;
      try {
        document.cookie = `_fbc=${fbc};path=/;max-age=7776000;SameSite=Lax`;
      } catch (e) {}
      return fbc;
    }
  } catch (e) {}

  // 3. Extract fbclid from URL search parameters (?fbclid=...)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      const creationTime = Date.now();
      fbc = `fb.1.${creationTime}.${fbclid}`;
      document.cookie = `_fbc=${fbc};path=/;max-age=7776000;SameSite=Lax`;
      localStorage.setItem('_fbc', fbc);
      sessionStorage.setItem('_fbc', fbc);
      return fbc;
    }
  } catch (e) {}

  // 4. Extract fbclid from document.referrer
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      const refFbclid = refUrl.searchParams.get('fbclid');
      if (refFbclid) {
        const creationTime = Date.now();
        fbc = `fb.1.${creationTime}.${refFbclid}`;
        document.cookie = `_fbc=${fbc};path=/;max-age=7776000;SameSite=Lax`;
        localStorage.setItem('_fbc', fbc);
        sessionStorage.setItem('_fbc', fbc);
        return fbc;
      }
    } catch (e) {}
  }

  return null;
};

export const saveCustomerProfile = (profile: {
  email?: string;
  phone?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  address?: string;
  zip?: string;
}) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredCustomerProfile();
    const fullName = (profile.fullName || '').trim() || existing.fullName;
    let firstName = profile.firstName || existing.firstName;
    let lastName = profile.lastName || existing.lastName;

    if (fullName && (!firstName || !lastName)) {
      const parts = fullName.split(' ');
      if (!firstName) firstName = parts[0];
      if (!lastName && parts.length > 1) lastName = parts.slice(1).join(' ');
    }

    const merged = {
      ...existing,
      ...(profile.email ? { email: profile.email.trim() } : {}),
      ...(profile.phone ? { phone: profile.phone.trim() } : {}),
      ...(fullName ? { fullName } : {}),
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(profile.city ? { city: profile.city.trim() } : {}),
      ...(profile.address ? { address: profile.address.trim() } : {}),
      ...(profile.zip ? { zip: profile.zip.trim() } : {}),
    };
    localStorage.setItem('sazo_customer_profile', JSON.stringify(merged));

    // Update Meta Pixel user properties dynamically if available
    if (window.fbq && (merged.email || merged.phone || merged.fullName || merged.city)) {
      try {
        const userProps: Record<string, any> = {
          external_id: getOrCreateClientId(),
          country: 'bd',
        };
        if (merged.email) userProps.em = merged.email;
        if (merged.phone) userProps.ph = merged.phone;
        if (merged.firstName) userProps.fn = merged.firstName;
        if (merged.lastName) userProps.ln = merged.lastName;
        if (merged.city) userProps.ct = merged.city;
        window.fbq('setUserProperties', initializedPixelId, userProps);
      } catch (e) {}
    }
  } catch (e) {}
};

export const getStoredCustomerProfile = (): {
  email?: string;
  phone?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  address?: string;
  zip?: string;
} => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('sazo_customer_profile');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return {};
};

export const initTrackingScripts = (settings: any) => {
  if (typeof window === 'undefined' || !settings) return;

  window.dataLayer = window.dataLayer || [];

  const pixelId = (settings.fbPixelId || settings.pixelId || settings.metaPixelId || '').trim();
  const gaId = (settings.gaMeasurementId || settings.ga4MeasurementId || '').trim();
  const gtmId = (settings.gtmId || '').trim();
  if (settings.fbTestCode && typeof settings.fbTestCode === 'string' && settings.fbTestCode.trim()) {
    activeFbTestCode = settings.fbTestCode.trim();
    try {
      localStorage.setItem('fb_test_code', activeFbTestCode);
      sessionStorage.setItem('fb_test_code', activeFbTestCode);
    } catch (e) {}
  }

  // Pre-initialize and capture fbc & fbp immediately on load
  getOrCreateFbp();
  getOrCreateFbc();

  // Read URL test code right away if present on load
  getActiveTestEventCode();

  // 1. Meta Pixel Script Injection
  if (pixelId && pixelId !== initializedPixelId) {
    initializedPixelId = pixelId;

    if (!document.getElementById('fb-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'fb-pixel-script';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];n.disablePushState=true;t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
      `;
      document.head.appendChild(script);
    }

    try {
      if (window.fbq) {
        (window.fbq as any).disablePushState = true;
        window.fbq('set', 'autoConfig', false, pixelId);

        const profile = getStoredCustomerProfile();
        const clientId = getOrCreateClientId();
        const advancedMatching: Record<string, any> = {
          external_id: clientId,
          country: 'bd',
        };
        if (profile.email) advancedMatching.em = profile.email;
        if (profile.phone) advancedMatching.ph = profile.phone;
        if (profile.firstName) advancedMatching.fn = profile.firstName;
        if (profile.lastName) advancedMatching.ln = profile.lastName;
        if (profile.city) advancedMatching.ct = profile.city;

        window.fbq('init', pixelId, advancedMatching);
      }

      console.log(`[Tracking] Meta Pixel Initialized with Advanced Matching: ${pixelId}`);
    } catch (e) {
      console.error('[Tracking] Meta Pixel Init Error:', e);
    }
  }

  // 2. GA4 Measurement Protocol / gtag.js Injection
  if (gaId && gaId !== initializedGa4Id) {
    initializedGa4Id = gaId;
    const gaScriptId = 'ga4-gtag-script';
    if (!document.getElementById(gaScriptId)) {
      const script = document.createElement('script');
      script.id = gaScriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      function gtag(...args: any[]) {
        (window.dataLayer = window.dataLayer || []).push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId);
      console.log(`[Tracking] GA4 Initialized: ${gaId}`);
    }
  }

  // 3. Google Tag Manager Injection
  if (gtmId && gtmId !== initializedGtmId) {
    initializedGtmId = gtmId;
    const gtmScriptId = 'gtm-script-tag';
    if (!document.getElementById(gtmScriptId)) {
      const script = document.createElement('script');
      script.id = gtmScriptId;
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement('noscript');
      noscript.id = 'gtm-noscript-tag';
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      if (document.body) {
        document.body.insertBefore(noscript, document.body.firstChild);
      }

      console.log(`[Tracking] GTM Initialized: ${gtmId}`);
    }
  }
};

const generateEventId = (eventName: string) => {
  return `${eventName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const pushToDataLayer = (payload: object) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const getOrCreateClientId = (): string => {
  if (typeof window === 'undefined') return '';
  let cid = '';
  try {
    cid = localStorage.getItem('sazo_client_id') || '';
    if (!cid) {
      cid = `sazo_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('sazo_client_id', cid);
    }
  } catch (e) {
    cid = `sazo_${Date.now()}`;
  }
  return cid;
};

const getOrCreateFbp = (): string => {
  if (typeof window === 'undefined') return '';
  let fbp = getCookie('_fbp') || getCookie('fbp');
  if (!fbp) {
    try {
      fbp = localStorage.getItem('_fbp');
    } catch (e) {}
  }
  if (!fbp) {
    fbp = `fb.1.${Date.now()}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    try {
      document.cookie = `_fbp=${fbp};path=/;max-age=7776000;SameSite=Lax`;
      localStorage.setItem('_fbp', fbp);
    } catch (e) {}
  }
  return fbp;
};

export const sendServerEvent = async (eventName: string, eventData: any, userData?: any, eventId?: string) => {
  if (typeof window === 'undefined') return;
  try {
    const fbp = getOrCreateFbp();
    const fbc = getOrCreateFbc();
    const clientId = getOrCreateClientId();
    const profile = getStoredCustomerProfile();
    const currentUrl = window.location.href;
    const testEventCode = getActiveTestEventCode();

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

    const enrichedUserData = {
      email: userData?.email || profile.email || undefined,
      phone: userData?.phone || userData?.phone_number || profile.phone || undefined,
      fullName: userData?.fullName || userData?.full_name || profile.fullName || undefined,
      firstName: userData?.firstName || userData?.first_name || profile.firstName || undefined,
      lastName: userData?.lastName || userData?.last_name || profile.lastName || undefined,
      city: userData?.city || profile.city || undefined,
      address: userData?.address || profile.address || undefined,
      zip: userData?.zip || userData?.postal_code || profile.zip || undefined,
      country: userData?.country || 'BD',
      userAgent: userAgent || userData?.userAgent,
      external_id: clientId || userData?.external_id,
      fbp: fbp || userData?.fbp,
      fbc: fbc || userData?.fbc,
      ...userData,
    };

    const payload = {
      eventName,
      gaClientId: clientId,
      test_event_code: testEventCode,
      pixelId: initializedPixelId || undefined,
      params: {
        ...eventData,
        event_id: eventId,
        event_source_url: currentUrl,
        test_event_code: testEventCode,
      },
      userData: enrichedUserData,
      url: currentUrl,
    };

    if (typeof fetch !== 'undefined') {
      fetch('/api/track/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(err => console.warn('[Tracking CAPI] Fetch error:', err));
    } else {
      await axios.post('/api/track/event', payload);
    }
  } catch (err) {
    console.warn('[Tracking CAPI] Failed to dispatch server event', err);
  }
};

export const trackServerEvent = sendServerEvent;

// Deduplication guard for page_view
let lastTrackedPageView = { path: '', timestamp: 0 };

// --- 1. PAGE VIEW EVENT ---
export const trackPageView = (pageName: string, url?: string) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const now = Date.now();

  // Deduplication: Prevent duplicate PageView within 2 seconds on the same path
  if (lastTrackedPageView.path === pathname && (now - lastTrackedPageView.timestamp) < 2000) {
    return;
  }
  lastTrackedPageView = { path: pathname, timestamp: now };

  const eventId = generateEventId('page_view');

  pushToDataLayer({
    event: 'page_view',
    page_title: pageName,
    page_location: currentUrl,
    event_id: eventId,
  });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'PageView', {}, { eventID: eventId });
    } catch (e) {
      console.warn('[FBQ Error]', e);
    }
  }

  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', 'page_view', { page_title: pageName, page_location: currentUrl });
    } catch (e) {
      console.warn('[GA4 Error]', e);
    }
  }

  sendServerEvent('PageView', { pageName, url: currentUrl }, undefined, eventId);
};

// Deduplication guard for view_item
let lastTrackedViewProduct = { id: '', timestamp: 0 };

// --- 2. VIEW CONTENT (Product View) ---
export const trackViewContent = (product: Product) => {
  if (!product) return;

  const productId = String(product.productId || product.id || (product as any)._id);
  const now = Date.now();

  // Prevent double-firing view_item within 1.5 seconds for the same product
  if (lastTrackedViewProduct.id === productId && (now - lastTrackedViewProduct.timestamp) < 1500) {
    return;
  }
  lastTrackedViewProduct = { id: productId, timestamp: now };

  const productValue = Number((product as any).discountPrice || product.price || 0);
  const eventId = generateEventId('ViewContent');
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const fbParams = {
    content_name: product.name,
    content_category: product.category || 'Fashion',
    content_ids: [productId],
    content_type: 'product',
    contents: [{ id: productId, quantity: 1, item_price: productValue }],
    value: productValue,
    currency: 'BDT',
    event_source_url: currentUrl,
  };

  pushToDataLayer({
    event: 'view_item',
    event_id: eventId,
    page_title: typeof document !== 'undefined' ? document.title : '',
    page_location: currentUrl,
    ecommerce: {
      currency: 'BDT',
      value: productValue,
      items: [
        {
          item_id: productId,
          item_name: product.name,
          item_category: product.category || 'Fashion',
          price: productValue,
          quantity: 1,
        },
      ],
    },
  });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', fbParams, { eventID: eventId });
    } catch (e) {
      console.warn('[FBQ ViewContent Error]', e);
    }
  }

  sendServerEvent('ViewContent', fbParams, undefined, eventId);
};

// --- 3. VIEW CATEGORY / ITEM LIST ---
export const trackViewCategory = (categoryName: string) => {
  if (!categoryName) return;
  const eventId = generateEventId('ViewCategory');

  pushToDataLayer({
    event: 'view_item_list',
    event_id: eventId,
    item_list_name: categoryName,
  });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('trackCustom', 'ViewCategory', { content_category: categoryName }, { eventID: eventId });
    } catch (e) {
      console.warn('[FBQ ViewCategory Error]', e);
    }
  }

  sendServerEvent('ViewCategory', { content_category: categoryName }, undefined, eventId);
};

// --- 4. SEARCH ---
export const trackSearch = (searchTerm: string) => {
  if (!searchTerm) return;
  const eventId = generateEventId('Search');

  pushToDataLayer({
    event: 'search',
    event_id: eventId,
    search_term: searchTerm,
  });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Search', { search_string: searchTerm }, { eventID: eventId });
    } catch (e) {
      console.warn('[FBQ Search Error]', e);
    }
  }

  sendServerEvent('Search', { search_string: searchTerm }, undefined, eventId);
};

// --- 5. ADD TO CART ---
export const trackAddToCart = (product: Product, size?: string, color?: string, quantity: number = 1) => {
  if (!product) return;

  const unitPrice = Number((product as any).discountPrice || product.price || 0);
  const totalValue = unitPrice * quantity;
  const productId = String(product.productId || product.id || (product as any)._id);
  const eventId = generateEventId('AddToCart');
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const fbParams = {
    content_name: product.name,
    content_category: product.category || 'Fashion',
    content_ids: [productId],
    content_type: 'product',
    value: totalValue,
    currency: 'BDT',
    contents: [{ id: productId, quantity: quantity, item_price: unitPrice }],
    event_source_url: currentUrl,
  };

  pushToDataLayer({
    event: 'add_to_cart',
    event_id: eventId,
    ecommerce: {
      currency: 'BDT',
      value: totalValue,
      items: [
        {
          item_id: productId,
          item_name: product.name,
          item_category: product.category || 'Fashion',
          price: unitPrice,
          quantity: quantity,
          item_variant: size || color ? `${size || ''} ${color || ''}`.trim() : undefined,
        },
      ],
    },
  });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'AddToCart', fbParams, { eventID: eventId });
    } catch (e) {
      console.warn('[FBQ AddToCart Error]', e);
    }
  }

  sendServerEvent('AddToCart', fbParams, undefined, eventId);
};

// Deduplication guard for initiate_checkout
let lastTrackedInitiateCheckout = { key: '', timestamp: 0 };

// --- 6. INITIATE CHECKOUT ---
export const trackInitiateCheckout = (cartItems: any[], totalAmount?: number) => {
  if (!cartItems || cartItems.length === 0) return;

  const contentIds = cartItems
    .map(item => String(item.productId || item.id || item.product?.productId || item.product?.id || item.product?._id || ''))
    .filter(Boolean);

  const cartKey = contentIds.slice().sort().join('_');
  const now = Date.now();

  // Deduplication: Prevent duplicate InitiateCheckout within 2 seconds for the same cart
  if (lastTrackedInitiateCheckout.key === cartKey && (now - lastTrackedInitiateCheckout.timestamp) < 2000) {
    return;
  }
  lastTrackedInitiateCheckout = { key: cartKey, timestamp: now };

  const calculatedTotal = (typeof totalAmount === 'number' && totalAmount > 0)
    ? totalAmount
    : cartItems.reduce((acc, item) => acc + (Number(item.price || item.product?.discountPrice || item.product?.price || 0) * (item.quantity || 1)), 0);

  const eventId = generateEventId('InitiateCheckout');
  const contents = cartItems.map(item => ({
    id: String(item.productId || item.id || item.product?.productId || item.product?.id || item.product?._id || ''),
    quantity: item.quantity || 1,
    item_price: Number(item.price || item.product?.discountPrice || item.product?.price || 0),
  }));
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const fbParams = {
    content_name: cartItems.map(i => i.name || i.product?.name || 'Product').join(', '),
    content_type: 'product',
    content_ids: contentIds,
    contents: contents,
    value: Number(calculatedTotal),
    currency: 'BDT',
    num_items: cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    event_source_url: currentUrl,
  };

  pushToDataLayer({
    event: 'begin_checkout',
    event_id: eventId,
    page_title: typeof document !== 'undefined' ? document.title : '',
    page_location: currentUrl,
    ecommerce: {
      currency: 'BDT',
      value: Number(calculatedTotal),
      items: cartItems.map((item, idx) => ({
        item_id: String(item.productId || item.id || item.product?.productId || item.product?.id || ''),
        item_name: item.name || item.product?.name || 'Product',
        price: Number(item.price || item.product?.discountPrice || item.product?.price || 0),
        quantity: item.quantity || 1,
        index: idx,
        item_variant: item.size || undefined,
      })),
    },
  });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', fbParams, { eventID: eventId });
    } catch (e) {
      console.warn('[FBQ InitiateCheckout Error]', e);
    }
  }

  sendServerEvent('InitiateCheckout', fbParams, undefined, eventId);
};

// Tracked purchase orders guard for deduplication
const trackedPurchaseOrders = new Set<string>();

const extractProductId = (item: any): string => {
  if (!item) return '';
  return String(
    item.productId || 
    item.id || 
    item.product?.productId || 
    item.product?.id || 
    item.product?._id || 
    ''
  ).trim();
};

// --- 7. PURCHASE ---
export const trackPurchase = (
  orderId: string, 
  cartItems: any[], 
  totalAmount: number, 
  userData?: {
    email?: string;
    phone?: string;
    fullName?: string;
    city?: string;
    address?: string;
  }
) => {
  if (!orderId || !cartItems || cartItems.length === 0) return;

  const cleanOrderId = String(orderId).trim();
  const sessionKey = `tracked_purchase_${cleanOrderId}`;

  if (typeof window !== 'undefined') {
    if (trackedPurchaseOrders.has(cleanOrderId) || sessionStorage.getItem(sessionKey)) {
      console.log(`[Tracking] Purchase event for order ${cleanOrderId} already tracked. Skipping.`);
      return;
    }
    trackedPurchaseOrders.add(cleanOrderId);
    try {
      sessionStorage.setItem(sessionKey, 'true');
    } catch (e) {}
  }

  const eventId = `Purchase_${cleanOrderId}`;
  const contentIds = cartItems.map(item => extractProductId(item)).filter(Boolean);
  const contents = cartItems.map(item => ({
    id: extractProductId(item),
    quantity: Number(item.quantity || 1),
    item_price: Number(item.price || item.product?.discountPrice || item.product?.price || 0),
  }));

  const totalQty = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const fbParams = {
    content_name: cartItems.map(i => i.name || i.product?.name || 'Product').join(', '),
    content_category: cartItems[0]?.category || cartItems[0]?.product?.category || 'Fashion',
    content_type: 'product',
    content_ids: contentIds.length > 0 ? contentIds : ['product'],
    contents: contents,
    value: Number(totalAmount),
    currency: 'BDT',
    num_items: totalQty,
    order_id: cleanOrderId,
    event_source_url: currentUrl,
  };

  const fullNameStr = (userData?.fullName || '').trim();
  const nameParts = fullNameStr ? fullNameStr.split(' ') : [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const formattedUserData = {
    email: userData?.email || '',
    phone: userData?.phone || '',
    fullName: fullNameStr,
    firstName: firstName,
    lastName: lastName,
    city: userData?.city || '',
    address: userData?.address || '',
  };

  // Push to DataLayer with complete Meta / GA4 schema including user_data & customer info
  pushToDataLayer({
    event: 'purchase',
    event_id: eventId,
    page_title: typeof document !== 'undefined' ? document.title : '',
    page_location: currentUrl,
    user_data: {
      email: formattedUserData.email,
      phone_number: formattedUserData.phone,
      first_name: formattedUserData.firstName,
      last_name: formattedUserData.lastName,
      address: {
        street: formattedUserData.address,
        city: formattedUserData.city,
        country: 'BD',
      },
    },
    user_info: {
      email: formattedUserData.email,
      phone: formattedUserData.phone,
      full_name: formattedUserData.fullName,
      city: formattedUserData.city,
      address: formattedUserData.address,
    },
    customer: {
      name: formattedUserData.fullName,
      phone: formattedUserData.phone,
      email: formattedUserData.email,
      city: formattedUserData.city,
      address: formattedUserData.address,
    },
    ecommerce: {
      transaction_id: cleanOrderId,
      value: Number(totalAmount),
      currency: 'BDT',
      tax: 0,
      items: cartItems.map(item => ({
        item_id: String(item.product?.productId || item.product?.id || item.product?._id || item.productId || item.id),
        item_name: item.product?.name || item.name || 'Product',
        item_category: item.product?.category || item.category || 'Fashion',
        price: Number(item.product?.discountPrice || item.product?.price || item.price || 0),
        quantity: item.quantity || 1,
        item_variant: item.selectedSize || item.size || item.selectedColor || item.color || undefined,
      })),
    },
  });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Purchase', fbParams, { eventID: eventId });
    } catch (e) {
      console.warn('[FBQ Purchase Error]', e);
    }
  }

  sendServerEvent('Purchase', fbParams, formattedUserData, eventId);
};

// --- 8. CONTACT FORM ---
export const trackContact = (formData?: any) => {
  const eventId = generateEventId('Contact');
  pushToDataLayer({ event: 'contact', event_id: eventId });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Contact', {}, { eventID: eventId });
    } catch (e) {
      console.warn('[FBQ Contact Error]', e);
    }
  }

  sendServerEvent('Contact', { status: 'submitted' }, formData, eventId);
};

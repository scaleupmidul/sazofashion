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

export const initTrackingScripts = (settings: { pixelId?: string; ga4MeasurementId?: string; gtmId?: string }) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  // 1. Meta Pixel Script Injection
  if (settings.pixelId && settings.pixelId.trim() !== '' && settings.pixelId !== initializedPixelId) {
    initializedPixelId = settings.pixelId;

    if (!document.getElementById('fb-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'fb-pixel-script';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
      `;
      document.head.appendChild(script);
    }

    try {
      if (window.fbq) {
        window.fbq('init', settings.pixelId);
        window.fbq('track', 'PageView');
      }
      console.log(`[Tracking] Meta Pixel Initialized: ${settings.pixelId}`);
    } catch (e) {
      console.error('[Tracking] Meta Pixel Init Error:', e);
    }
  }

  // 2. GA4 Measurement Protocol / gtag.js Injection
  if (settings.ga4MeasurementId && settings.ga4MeasurementId.trim() !== '' && settings.ga4MeasurementId !== initializedGa4Id) {
    initializedGa4Id = settings.ga4MeasurementId;
    const gaScriptId = 'ga4-gtag-script';
    if (!document.getElementById(gaScriptId)) {
      const script = document.createElement('script');
      script.id = gaScriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.ga4MeasurementId}`;
      document.head.appendChild(script);

      function gtag(...args: any[]) {
        (window.dataLayer = window.dataLayer || []).push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', settings.ga4MeasurementId);
      console.log(`[Tracking] GA4 Initialized: ${settings.ga4MeasurementId}`);
    }
  }

  // 3. Google Tag Manager Injection
  if (settings.gtmId && settings.gtmId.trim() !== '' && settings.gtmId !== initializedGtmId) {
    initializedGtmId = settings.gtmId;
    const gtmScriptId = 'gtm-script-tag';
    if (!document.getElementById(gtmScriptId)) {
      const script = document.createElement('script');
      script.id = gtmScriptId;
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.gtmId}');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement('noscript');
      noscript.id = 'gtm-noscript-tag';
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);

      console.log(`[Tracking] GTM Initialized: ${settings.gtmId}`);
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

export const sendServerEvent = async (eventName: string, eventData: any, userData?: any, eventId?: string) => {
  if (typeof window === 'undefined') return;
  try {
    await axios.post('/api/tracking', {
      eventName,
      eventData: {
        ...eventData,
        event_id: eventId,
      },
      userData,
      url: window.location.href,
    });
  } catch (err) {
    console.warn('[Tracking CAPI] Failed to dispatch server event', err);
  }
};

export const trackServerEvent = sendServerEvent;

// --- 1. PAGE VIEW EVENT ---
export const trackPageView = (pageName: string, url?: string) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const eventId = generateEventId('page_view');

  pushToDataLayer({
    event: 'page_view',
    page_title: pageName,
    page_location: currentUrl,
    event_id: eventId,
  });

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'PageView', { page_title: pageName }, { eventID: eventId });
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

// --- 2. VIEW CONTENT (Product View) ---
export const trackViewContent = (product: Product) => {
  if (!product) return;

  const productValue = Number((product as any).discountPrice || product.price || 0);
  const productId = String(product.productId || product.id || (product as any)._id);
  const eventId = generateEventId('ViewContent');

  const fbParams = {
    content_name: product.name,
    content_category: product.category || 'Fashion',
    content_ids: [productId],
    content_type: 'product',
    value: productValue,
    currency: 'BDT',
  };

  pushToDataLayer({
    event: 'view_item',
    event_id: eventId,
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

  const fbParams = {
    content_name: product.name,
    content_category: product.category || 'Fashion',
    content_ids: [productId],
    content_type: 'product',
    value: totalValue,
    currency: 'BDT',
    contents: [{ id: productId, quantity: quantity, item_price: unitPrice }],
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

// --- 6. INITIATE CHECKOUT ---
export const trackInitiateCheckout = (cartItems: any[], totalAmount: number) => {
  if (!cartItems || cartItems.length === 0) return;

  const eventId = generateEventId('InitiateCheckout');
  const contentIds = cartItems.map(item => String(item.product?.productId || item.product?.id || item.product?._id || item.productId || item.id));
  const contents = cartItems.map(item => ({
    id: String(item.product?.productId || item.product?.id || item.product?._id || item.productId || item.id),
    quantity: item.quantity || 1,
    item_price: Number(item.product?.discountPrice || item.product?.price || item.price || 0),
  }));

  const fbParams = {
    content_type: 'product',
    content_ids: contentIds,
    contents: contents,
    value: Number(totalAmount),
    currency: 'BDT',
    num_items: cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
  };

  pushToDataLayer({
    event: 'begin_checkout',
    event_id: eventId,
    ecommerce: {
      currency: 'BDT',
      value: Number(totalAmount),
      items: cartItems.map(item => ({
        item_id: String(item.product?.productId || item.product?.id || item.product?._id || item.productId || item.id),
        item_name: item.product?.name || item.name || 'Product',
        price: Number(item.product?.discountPrice || item.product?.price || item.price || 0),
        quantity: item.quantity || 1,
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

// --- 7. PURCHASE ---
export const trackPurchase = (orderId: string, cartItems: any[], totalAmount: number, userData?: any) => {
  if (!cartItems || cartItems.length === 0) return;

  const eventId = generateEventId('Purchase');
  const contentIds = cartItems.map(item => String(item.product?.productId || item.product?.id || item.product?._id || item.productId || item.id));
  const contents = cartItems.map(item => ({
    id: String(item.product?.productId || item.product?.id || item.product?._id || item.productId || item.id),
    quantity: item.quantity || 1,
    item_price: Number(item.product?.discountPrice || item.product?.price || item.price || 0),
  }));

  const fbParams = {
    content_type: 'product',
    content_ids: contentIds,
    contents: contents,
    value: Number(totalAmount),
    currency: 'BDT',
    num_items: cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    order_id: orderId,
  };

  pushToDataLayer({
    event: 'purchase',
    event_id: eventId,
    ecommerce: {
      transaction_id: orderId,
      currency: 'BDT',
      value: totalAmount,
      items: cartItems.map(item => ({
        item_id: String(item.product?.productId || item.product?.id || item.product?._id || item.productId || item.id),
        item_name: item.product?.name || item.name || 'Product',
        price: Number(item.product?.discountPrice || item.product?.price || item.price || 0),
        quantity: item.quantity || 1,
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

  sendServerEvent('Purchase', fbParams, userData, eventId);
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

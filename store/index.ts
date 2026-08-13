
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Product, CartItem, Order, OrderStatus, ContactMessage, AppSettings, AdminProductsResponse } from '../types';
import { trackServerEvent, trackAddToCart } from '../services/trackingService';

const API_URL = '/api';

const getTokenFromStorage = (): string | null => {
    return localStorage.getItem('sazo_admin_token') || localStorage.getItem('unique_corner_admin_token');
};

const DEFAULT_SETTINGS: AppSettings = {
    onlinePaymentInfo: 'To confirm your order, please pay the delivery charge in advance to —\n<b>01909285883 (Personal)</b>\nvia Bkash or Nagad\nand fill in the details below:',
    onlinePaymentInfoStyles: { fontSize: '0.875rem' },
    codEnabled: true, onlinePaymentEnabled: true, onlinePaymentMethods: [],
    sliderImages: [], 
    categoryImages: [], 
    categories: [], 
    pausedCategories: [],
    menuCategories: [],
    shippingOptions: [], 
    sizeGuide: [
      { size: 'S', chest: '36', waist: '30', length: '40' },
      { size: 'M', chest: '38', waist: '32', length: '41' },
      { size: 'L', chest: '40', waist: '34', length: '42' },
      { size: 'XL', chest: '42', waist: '36', length: '43' },
    ],
    contactAddress: '', contactPhone: '', contactEmail: '', whatsappNumber: '', showWhatsAppButton: false,
    socialMediaLinks: [], privacyPolicy: '', adminEmail: '', adminPassword: '', footerDescription: '',
    homepageNewArrivalsCount: 4, homepageTrendingCount: 4,
    showSliderText: true,
    signatureBanners: [],
    exitIntentPopupEnabled: false,
    exitIntentDiscount: 60,
    exitIntentCouponCode: 'SAVE60',
    freeShippingEnabled: false,
    brandVideoEnabled: true,
    brandVideoUrl: '',
    brandVideoMobileUrl: '',
    brandVideoTitle: 'Sazo Couture',
    brandVideoSubtitle: 'Behind The Craft',
    brandVideoPoster: '',
    brandVideoMobilePoster: ''
};

const MOCK_PRODUCTS_DATA: any[] = [
  { id: '101', productId: '101', name: "Midnight Rose Silk Gown", category: "Premium Silk", price: 8500, description: "A breathtaking midnight rose silk gown handcrafted for the modern woman.", fabric: "Pure Mulberry Silk", colors: ["Midnight Blue"], sizes: ["S", "M", "L"], isNewArrival: true, isTrending: true, onSale: false, images: [] },
  { id: '102', productId: '102', name: "Azure Breeze Cotton Kurti", category: "Cotton Collection", price: 3200, description: "Stay cool and elegant in our Azure Breeze kurti.", fabric: "100% Organic Cotton", colors: ["Azure Blue"], sizes: ["M", "L", "XL"], isNewArrival: true, isTrending: true, onSale: false, images: [] }
];

export const useAppStore = create<any>()(
  persist(
    (set, get) => ({
        path: window.location.pathname,
        products: MOCK_PRODUCTS_DATA,
        orders: [],
        contactMessages: [],
        settings: DEFAULT_SETTINGS,
        cart: [],
        selectedProduct: null,
        notification: null,
        loading: true,
        isAdminAuthenticated: !!getTokenFromStorage(),
        cartTotal: 0,
        fullProductsLoaded: false,
        adminProducts: [],
        adminProductsPagination: { page: 1, pages: 1, total: 0 },
        dashboardStats: null,
        newOrdersCount: 0,
        
        navigate: (newPath: string, options?: { scroll?: boolean }) => {
            const shouldScroll = options?.scroll ?? true;
            if (window.location.pathname !== newPath) {
                window.history.pushState({}, '', newPath);
            }
            set({ path: newPath });
            if (shouldScroll) {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }
        },

        loadInitialData: async () => {
            try {
                // Fetch home data (settings + featured products)
                const homeDataRes = await fetch(`${API_URL}/page-data/home`);
                if (!homeDataRes.ok) throw new Error('Failed to fetch initial page data.');
                const homeData = await homeDataRes.json();
                
                set({
                    products: homeData.products || MOCK_PRODUCTS_DATA,
                    settings: homeData.settings || DEFAULT_SETTINGS,
                    loading: false
                });

                // Background load ALL products for shop page after a very short break
                // This ensures LCP is handled first
                requestAnimationFrame(() => {
                    get().ensureAllProductsLoaded();
                });
                
            } catch (error) {
                set({ 
                    products: MOCK_PRODUCTS_DATA, 
                    settings: DEFAULT_SETTINGS, 
                    loading: false,
                    fullProductsLoaded: true 
                });
            }
        },

        fetchSettings: async () => {
            try {
                const res = await fetch(`${API_URL}/page-data/home`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.settings) {
                        set({ settings: data.settings });
                    }
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        },

        fetchProducts: async () => {
            return get().ensureAllProductsLoaded();
        },

        loadAdminData: async () => {
            const { isAdminAuthenticated } = get();
            if (!isAdminAuthenticated) return;
            const token = getTokenFromStorage();
            if (!token) return;
            const headers = { 'Authorization': `Bearer ${token}` };
            try {
                const [ordersRes, messagesRes, statsRes, settingsRes] = await Promise.all([
                    fetch(`${API_URL}/orders`, { headers }),
                    fetch(`${API_URL}/messages`, { headers }),
                    fetch(`${API_URL}/orders/stats`, { headers }),
                    fetch(`${API_URL}/settings/admin`, { headers })
                ]);
                
                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    set({ settings: settingsData });
                }

                if (ordersRes.ok && messagesRes.ok && statsRes.ok) {
                    const ordersData = await ordersRes.json();
                    const messagesData = await messagesRes.json();
                    const statsData = await statsRes.json();
                    
                    const lastSeenOrders = localStorage.getItem('sazo_admin_last_orders_seen') || localStorage.getItem('unique_corner_admin_last_orders_seen');
                    const lastSeenOrdersDate = lastSeenOrders ? new Date(lastSeenOrders) : new Date(0);
                    const newOrders = ordersData.filter((o: Order) => {
                        const oDate = o.createdAt ? new Date(o.createdAt) : new Date(o.date);
                        return oDate > lastSeenOrdersDate;
                    });
                    set({ orders: ordersData, contactMessages: messagesData, dashboardStats: statsData, newOrdersCount: newOrders.length });
                }
            } catch (error) {
                console.error("Failed to load admin data", error);
            }
        },

        ensureAllProductsLoaded: async () => {
            const { fullProductsLoaded, products: existingProducts } = get();
            if (fullProductsLoaded) return;
            try {
                const res = await fetch(`${API_URL}/products`);
                if (!res.ok) throw new Error('Failed to fetch all products');
                let allProducts: Product[] = await res.json();
                
                // Merge products: If an existing product has MORE images (e.g. loaded via refreshProduct), preserve those images!
                const productMap = new Map<string, Product>();
                existingProducts.forEach(p => {
                    const key = String(p.id || p.productId || (p as any)._id);
                    if (key) productMap.set(key, p);
                });

                allProducts.forEach(p => {
                    const key = String(p.id || p.productId || (p as any)._id);
                    const existing = productMap.get(key);
                    const existingImgs = existing?.images?.length || 0;
                    const pImgs = p?.images?.length || 0;
                    if (existing && existingImgs > pImgs) {
                        productMap.set(key, { ...p, images: existing.images });
                    } else {
                        productMap.set(key, p);
                    }
                });

                set(state => {
                    let newSelected = state.selectedProduct;
                    if (newSelected) {
                        const selKey = String(newSelected.id || newSelected.productId || (newSelected as any)._id);
                        const matchInMap = productMap.get(selKey);
                        if (matchInMap && (matchInMap.images?.length || 0) > (newSelected.images?.length || 0)) {
                            newSelected = matchInMap;
                        }
                    }
                    return { 
                        products: Array.from(productMap.values()), 
                        selectedProduct: newSelected,
                        fullProductsLoaded: true 
                    };
                });
            } catch (error) {
                console.error("Failed to load all products", error);
            }
        },

        loadAdminProducts: async (page, searchTerm) => {
            const token = getTokenFromStorage();
            if (!token) return;
            try {
                const params = new URLSearchParams({ page: String(page), search: searchTerm });
                const res = await fetch(`${API_URL}/products/admin?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch admin products');
                const data: AdminProductsResponse = await res.json();
                set({ adminProducts: data.products, adminProductsPagination: { page: data.page, pages: data.pages, total: data.total } });
            } catch (error) {
                get().notify("Could not load products for admin panel.", "error");
            }
        },

        setProducts: (products) => set({ products }),
        setSelectedProduct: (product) => set({ selectedProduct: product }),
        
        refreshProduct: async (id: string) => {
            try {
                const res = await fetch(`${API_URL}/products/${id}`);
                if (!res.ok) return;
                const freshProduct = await res.json();
                set(state => {
                    const isMatch = (p: Product) => 
                        String(p.id) === String(freshProduct.id) || 
                        String(p.productId) === String(freshProduct.productId) ||
                        ((p as any)._id && (freshProduct as any)._id && String((p as any)._id) === String((freshProduct as any)._id)) ||
                        String(p.id) === String(id) ||
                        String(p.productId) === String(id);

                    const updatedProducts = state.products.map(p => isMatch(p) ? { ...p, ...freshProduct } : p);
                    if (!updatedProducts.some(p => isMatch(p))) {
                        updatedProducts.push(freshProduct);
                    }

                    let newSelected = state.selectedProduct;
                    const isSelectedMatch = !newSelected || 
                        String(newSelected.id) === String(freshProduct.id) || 
                        String(newSelected.productId) === String(freshProduct.productId) ||
                        ((newSelected as any)._id && (freshProduct as any)._id && String((newSelected as any)._id) === String((freshProduct as any)._id)) ||
                        String(newSelected.id) === String(id) ||
                        String(newSelected.productId) === String(id);

                    if (isSelectedMatch) {
                        newSelected = freshProduct;
                    }
                    return { products: updatedProducts, selectedProduct: newSelected };
                });
            } catch (e) {
                console.error("Failed to refresh product", e);
            }
        },

        notify: (message, type = 'success') => {
            set({ notification: { message, type } });
            setTimeout(() => set({ notification: null }), 3000);
        },
        
        addToCart: (product, quantity = 1, size) => {
            if (!size) {
                get().notify("Please select a size.", "error");
                return;
            }
            const { cart } = get();
            const existingItem = cart.find(item => item.id === product.id && item.size === size);
            const itemIdForAnalytics = product.productId || product.id;
            let newCart;
            if (existingItem) {
                get().notify(`Quantity updated for ${product.name} (Size: ${size})!`, 'success');
                newCart = cart.map(item => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + quantity } : item);
            } else {
                const newItem: CartItem = { id: product.id, productId: itemIdForAnalytics, name: product.name, price: product.price, quantity: quantity, image: product.images[0], size: size };
                get().notify(`${product.name} (Size: ${size}) added to cart!`, 'success');
                newCart = [...cart, newItem];
            }
            set({ cart: newCart });
            get()._updateCartTotal();

            // Track AddToCart via tracking service
            trackAddToCart(product, size, undefined, quantity);
        },
        
        updateCartQuantity: (id, size, newQuantity) => {
            const { cart } = get();
            let newCart;
            if (newQuantity <= 0) {
                newCart = cart.filter(item => !(item.id === id && item.size === size));
            } else {
                newCart = cart.map(item => item.id === id && item.size === size ? { ...item, quantity: newQuantity } : item);
            }
            set({ cart: newCart });
            get()._updateCartTotal();
        },
        
        clearCart: () => {
            set({ cart: [] });
            get()._updateCartTotal();
        },
        
        _updateCartTotal: () => {
            set(state => ({ cartTotal: state.cart.reduce((total, item) => total + (item.price * item.quantity), 0) }));
        },

        login: async (email, password) => {
            try {
                const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
                if (!res.ok) {
                    const contentType = res.headers.get('content-type');
                    let errorData;
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await res.json().catch(() => ({ message: 'Login failed (Invalid JSON response)' }));
                    } else {
                        const errorText = await res.text().catch(() => 'No detail');
                        console.error('Non-JSON Error Response:', errorText);
                        errorData = { message: `Server Error (Status: ${res.status}). ${errorText.substring(0, 50)}` };
                    }
                    // Handle detailed error reporting from server if available
                    const errorMessage = errorData.error ? `${errorData.message}: ${errorData.error}` : (errorData.message || 'Incorrect email or password.');
                    throw new Error(errorMessage);
                }
                const { token } = await res.json();
                localStorage.setItem('unique_corner_admin_token', token);
                set({ isAdminAuthenticated: true });
                get().loadAdminData();
                get().navigate('/admin/dashboard');
                get().notify('Login successful!', 'success');
                return true;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Incorrect email or password.';
                get().notify(message, 'error');
                return false;
            }
        },

        resetAdminPassword: async (email) => {
            try {
                const res = await fetch(`${API_URL}/auth/reset-access`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ email }) 
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Retrieval failed');
                }
                get().notify(data.message || 'Credentials retrieved successfully! Check your email.', 'success');
                return true;
            } catch (error) {
                get().notify(error instanceof Error ? error.message : 'Retrieval failed', 'error');
                return false;
            }
        },

        logout: () => {
            localStorage.removeItem('sazo_admin_token');
            localStorage.removeItem('unique_corner_admin_token');
            set({ isAdminAuthenticated: false, orders: [], contactMessages: [], dashboardStats: null });
            get().navigate('/');
            get().notify('You have been logged out.', 'success');
        },

        addProduct: async (productData) => {
            const token = getTokenFromStorage();
            const res = await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(productData) });
            const newProduct = await res.json();
            set(state => ({ products: [newProduct, ...state.products] }));
            get().notify('Product added successfully!', 'success');
        },
        
        updateProduct: async (updatedProduct) => {
            const token = getTokenFromStorage();
            const res = await fetch(`${API_URL}/products/${updatedProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updatedProduct) });
            const savedProduct = await res.json();
            set(state => ({ products: state.products.map(p => p.id === savedProduct.id ? savedProduct : p), selectedProduct: state.selectedProduct?.id === savedProduct.id ? savedProduct : state.selectedProduct }));
            get().notify('Product updated successfully!', 'success');
        },

        deleteProduct: async (id) => {
            const token = getTokenFromStorage();
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            set(state => ({ products: state.products.filter(p => p.id !== id) }));
            get().notify('Product deleted successfully.', 'success');
        },

        updateOrderStatus: async (orderId, status) => {
            const token = getTokenFromStorage();
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) });
            const updatedOrder = await res.json();
            set(state => ({ orders: state.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o) }));
            get().notify(`Order ${orderId} status updated to ${status}.`, 'success');
        },

        refreshOrders: async () => {
            const token = getTokenFromStorage();
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!res.ok) throw new Error('Failed to fetch orders');
                const ordersData = await res.json();
                const lastSeenOrders = localStorage.getItem('sazo_admin_last_orders_seen') || localStorage.getItem('unique_corner_admin_last_orders_seen');
                const lastSeenOrdersDate = lastSeenOrders ? new Date(lastSeenOrders) : new Date(0);
                const newOrders = ordersData.filter((o: Order) => {
                    const oDate = o.createdAt ? new Date(o.createdAt) : new Date(o.date);
                    return oDate > lastSeenOrdersDate;
                });
                set({ orders: ordersData, newOrdersCount: newOrders.length });
                get().notify('Orders list refreshed.', 'success');
            } catch (error) {
                get().notify("Could not refresh orders.", "error");
            }
        },
        
        markOrdersAsSeen: () => {
            localStorage.setItem('sazo_admin_last_orders_seen', new Date().toISOString());
            set({ newOrdersCount: 0 });
        },

        addOrder: async (customerDetails, cartItems, total, paymentInfo, shippingCharge, discountAmount, couponCode) => {
            // Helper to get Google Analytics Client ID from cookies
            const getGaClientId = () => {
                try {
                    const cookie = document.cookie.split('; ').find(row => row.startsWith('_ga='));
                    if (cookie) {
                        const parts = cookie.split('=')[1].split('.');
                        return `${parts[2]}.${parts[3]}`;
                    }
                } catch (e) {}
                return null;
            };

            const gaClientId = getGaClientId();

            const res = await fetch(`${API_URL}/orders`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    customerDetails, 
                    cartItems, 
                    total, 
                    paymentInfo, 
                    shippingCharge,
                    discountAmount,
                    couponCode,
                    gaClientId // Sending to backend for server-side tracking
                }) 
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || "Failed to place order. Please check your details.");
            }
            const newOrder = await res.json();
            if(get().isAdminAuthenticated) set(state => ({ orders: [newOrder, ...state.orders] }));
            return newOrder;
        },

        deleteOrder: async (orderId) => {
            const token = getTokenFromStorage();
            await fetch(`${API_URL}/orders/${orderId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            set(state => ({ orders: state.orders.filter(order => order.id !== orderId) }));
            get().notify(`Order ${orderId} has been deleted.`, 'success');
        },
        
        addContactMessage: async (messageData) => {
            await fetch(`${API_URL}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData) });
        },

        markMessageAsRead: async (messageId, isRead) => {
            const token = getTokenFromStorage();
            const res = await fetch(`${API_URL}/messages/${messageId}/read`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ isRead }) });
            const updatedMessage = await res.json();
            set(state => ({ contactMessages: state.contactMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg) }));
            get().notify(`Message marked as ${isRead ? 'read' : 'unread'}.`, 'success');
        },

        deleteContactMessage: async (messageId) => {
            const token = getTokenFromStorage();
            await fetch(`${API_URL}/messages/${messageId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            set(state => ({ contactMessages: state.contactMessages.filter(msg => msg.id !== messageId) }));
            get().notify('Message has been deleted.', 'success');
        },
        
        updateSettings: async (newSettings) => {
            try {
                const token = getTokenFromStorage();
                const res = await fetch(`${API_URL}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newSettings) });
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: 'Failed to update settings.' }));
                    throw new Error(errorData.message || 'Failed to update settings.');
                }
                const updatedSettings = await res.json();
                set({ settings: updatedSettings });
                get().notify('Settings updated successfully!', 'success');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                get().notify(`Error: ${errorMessage}`, 'error');
                throw error;
            }
        },
    }),
    {
      name: 'sazo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart, settings: state.settings, products: state.products }),
      merge: (persistedState: any, currentState: AppState) => {
        if (!persistedState || typeof persistedState !== 'object') return currentState;
        let safeCart: CartItem[] = [];
        if (Array.isArray(persistedState.cart)) {
            safeCart = persistedState.cart.filter((item: any) => item && typeof item === 'object');
        }
        const merged = { ...currentState, ...persistedState, cart: safeCart };
        merged.cartTotal = safeCart.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
        return merged;
      },
    }
  )
);

window.addEventListener('popstate', () => { useAppStore.setState({ path: window.location.pathname }); });
useAppStore.getState().loadInitialData();

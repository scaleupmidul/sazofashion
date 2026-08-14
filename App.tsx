
// App.tsx

import React, { useEffect, Suspense } from 'react';
import { useAppStore } from './store';
import Header from './components/Header';
import { initTrackingScripts, trackPageView } from './services/trackingService';
import Footer from './components/Footer';
import Notification from './components/Notification';
import WhatsAppButton from './components/WhatsAppButton';
import PageLoader from './components/PageLoader';
import ProgressBar from './components/ProgressBar';
import PageSkeleton from './components/PageSkeleton';
import ExitIntentPopup from './components/ExitIntentPopup';

// CORE PAGES: Static imports for instant performance on home/shop
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';

// ADMIN PAGES: Lazy loading to reduce initial bundle size
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminMessagesPage = React.lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminPaymentInfoPage = React.lazy(() => import('./pages/admin/AdminPaymentInfoPage'));

// INFORMATIONAL PAGES: Lazy loading
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PolicyPage = React.lazy(() => import('./pages/PolicyPage'));

// Initialize the dataLayer for analytics
declare global {
  interface Window { dataLayer: any[]; }
}
window.dataLayer = window.dataLayer || [];

import { motion } from 'motion/react';

const App: React.FC = () => {
  const path = useAppStore(state => state.path);
  const navigate = useAppStore(state => state.navigate);
  const products = useAppStore(state => state.products);
  const selectedProduct = useAppStore(state => state.selectedProduct);
  const setSelectedProduct = useAppStore(state => state.setSelectedProduct);
  const notification = useAppStore(state => state.notification);
  const isAdminAuthenticated = useAppStore(state => state.isAdminAuthenticated);
  const showWhatsAppButton = useAppStore(state => state.settings.showWhatsAppButton);
  const settings = useAppStore(state => state.settings);
  const loadInitialData = useAppStore(state => state.loadInitialData);
  const fetchSettings = useAppStore(state => state.fetchSettings);
  const fetchProducts = useAppStore(state => state.fetchProducts);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (typeof loadInitialData === 'function') {
      loadInitialData();
    }
  }, [loadInitialData]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 400);
    
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => clearTimeout(timer);
  }, [path]);

  useEffect(() => {
    if (settings) {
      initTrackingScripts(settings);
    }
  }, [settings]);

  useEffect(() => {
    const productMatch = path.match(/^\/product\/(.+)$/);
    if (productMatch) {
        const urlId = productMatch[1].split('?')[0];
        
        // Check if currently selected product matches the URL
        const isCurrentMatch = selectedProduct && (
            selectedProduct.productId === urlId || 
            selectedProduct.id === urlId || 
            (selectedProduct._id && String(selectedProduct._id) === urlId)
        );

        const productFromList = products.find(p => p.productId === urlId || p.id === urlId || (p._id && String(p._id) === urlId));

        if (!isCurrentMatch) {
            if (productFromList) {
                setSelectedProduct(productFromList);
            }
        } else if (selectedProduct && productFromList) {
            // Only replace selectedProduct if productFromList has strictly MORE images
            const listImgCount = productFromList.images ? productFromList.images.length : 0;
            const currentImgCount = selectedProduct.images ? selectedProduct.images.length : 0;
            if (listImgCount > currentImgCount) {
                setSelectedProduct(productFromList);
            }
        }
    } else {
        if (selectedProduct !== null) {
            setSelectedProduct(null);
        }
    }
  }, [path, products, selectedProduct, setSelectedProduct]);
  
  useEffect(() => {
    const BASE_TITLE = 'SAZO';
    let pageTitle = BASE_TITLE;
    const productMatch = path.match(/^\/product\/(.+)$/);
    const categoryMatch = path.match(/^\/category\/(.+)$/);
    if (productMatch && selectedProduct) {
        pageTitle = `${selectedProduct.name} - ${BASE_TITLE}`;
    } else if (categoryMatch) {
        const catSlug = decodeURIComponent(categoryMatch[1]);
        const capitalized = catSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        pageTitle = `${capitalized} - ${BASE_TITLE}`;
    } else if (path.startsWith('/admin')) {
        pageTitle = `Admin Panel - ${BASE_TITLE}`;
    } else {
        switch (path) {
            case '/': pageTitle = `${BASE_TITLE} - Premium Luxury Collection`; break;
            case '/shop': pageTitle = `Shop All - ${BASE_TITLE}`; break;
            case '/cart': pageTitle = `Your Edit - ${BASE_TITLE}`; break;
            case '/checkout': pageTitle = `Secure Checkout - ${BASE_TITLE}`; break;
        }
    }
    document.title = pageTitle;
  }, [path, selectedProduct]);

  useEffect(() => {
    const BASE_TITLE = 'SAZO';
    let pageTitle = BASE_TITLE;
    const categoryMatch = path.match(/^\/category\/(.+)$/);
    if (categoryMatch) {
        const catSlug = decodeURIComponent(categoryMatch[1]);
        const capitalized = catSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        pageTitle = `${capitalized} - ${BASE_TITLE}`;
    } else if (path.startsWith('/admin')) {
        pageTitle = `Admin Panel - ${BASE_TITLE}`;
    } else {
        switch (path) {
            case '/': pageTitle = `${BASE_TITLE} - Premium Luxury Collection`; break;
            case '/shop': pageTitle = `Shop All - ${BASE_TITLE}`; break;
            case '/cart': pageTitle = `Your Edit - ${BASE_TITLE}`; break;
            case '/checkout': pageTitle = `Secure Checkout - ${BASE_TITLE}`; break;
        }
    }
    trackPageView(pageTitle, window.location.href);
  }, [path]);
  
  useEffect(() => {
    const adminPageCheck = path.startsWith('/admin') && path !== '/admin/login';
    if (adminPageCheck && !isAdminAuthenticated) {
        navigate('/admin/login');
    }
  }, [path, isAdminAuthenticated, navigate]);


  const isCustomerPage = !path.startsWith('/admin');
  const isProductPage = path.startsWith('/product/');

  const renderAdminPageContent = () => {
     if (path === '/admin/dashboard') return <AdminDashboardPage />;
     if (path === '/admin/products') return <AdminProductsPage />;
     if (path === '/admin/orders') return <AdminOrdersPage />;
     if (path === '/admin/messages') return <AdminMessagesPage />;
     if (path === '/admin/settings') return <AdminSettingsPage />;
     if (path === '/admin/payment-info' || path === '/admin/transactions') return <AdminPaymentInfoPage />;
     return <AdminDashboardPage />;
  }

  const renderPage = () => {
    if (path === '/admin/login') {
      return (
        <Suspense fallback={<PageLoader />}>
          <AdminLoginPage />
        </Suspense>
      );
    }

    if (path.startsWith('/admin')) {
      return (
        <Suspense fallback={<PageLoader />}>
          <AdminLayout>
              {renderAdminPageContent()}
          </AdminLayout>
        </Suspense>
      );
    }
    
    if (path.startsWith('/product/')) return <ProductDetailsPage />;
    if (path.startsWith('/thank-you/')) {
        const orderId = path.split('/')[2];
        return <ThankYouPage orderId={orderId} />;
    }

    if (path.startsWith('/category/')) {
        const categorySlug = decodeURIComponent(path.split('/')[2]);
        const categories = useAppStore.getState().settings?.categories || [];
        const matchedCategory = categories.find((c: string) => 
            c.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase().trim().replace(/\s+/g, '-') ||
            c.toLowerCase() === categorySlug.toLowerCase().trim()
        ) || categorySlug;
        return <CategoryPage categoryName={matchedCategory} />;
    }

    switch (path) {
      case '/': return <HomePage />;
      case '/shop': return <ShopPage />;
      case '/cart': return <CartPage />;
      case '/checkout': return <CheckoutPage />;
      case '/contact': return <Suspense fallback={<PageSkeleton />}><ContactPage /></Suspense>;
      case '/policy': return <Suspense fallback={<PageSkeleton />}><PolicyPage /></Suspense>;
      default: return <HomePage />;
    }
  };

  return (
    <div className={`min-h-screen ${isCustomerPage ? 'bg-brand-offwhite' : 'bg-stone-50'} font-sans flex flex-col relative`}>
      <ProgressBar isNavigating={isNavigating} />
      <Notification notification={notification} />
      {isCustomerPage && <Header />}
      
      <main className={`flex-grow flex flex-col pb-0 relative ${isCustomerPage && !isProductPage ? 'pt-[68px] sm:pt-[84px]' : ''}`}>
          <motion.div
            key={path}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-grow flex flex-col"
          >
            {renderPage()}
          </motion.div>
      </main>

      {isCustomerPage && showWhatsAppButton && <WhatsAppButton />}
      {isCustomerPage && <ExitIntentPopup />}
      {isCustomerPage && <Footer />}
    </div>
  );
};

export default App;

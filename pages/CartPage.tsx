
// pages/CartPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { CartItem } from '../types';
import { ShoppingCart, Truck, X, ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';
import { trackServerEvent } from '../services/trackingService';
import { motion } from 'motion/react';
import { Skeleton, Shimmer } from '../components/Skeleton';

const CartItemComponent: React.FC<{ item: CartItem, updateCartQuantity: (id: string, size: string, newQuantity: number) => void }> = ({ item, updateCartQuantity }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-6 py-8 border-b border-stone-100 last:border-0 group"
    >
        <div className="w-24 sm:w-32 aspect-[3/4] flex-shrink-0 overflow-hidden rounded-none bg-[#f8f6f3] relative">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
        </div>

        <div className="flex flex-col flex-1 justify-between py-1">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                    <h3 className="font-product text-lg sm:text-xl font-medium text-stone-900 line-clamp-1">{item.name}</h3>
                    <p className="text-[10px] lg:text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                        Variation: {item.size === 'Free' ? 'Free Size' : item.size}
                    </p>
                </div>
                <button 
                  onClick={() => updateCartQuantity(item.id, item.size, 0)} 
                  className="text-[#b7b7b7] hover:text-brand-accent transition-colors p-1"
                >
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
            </div>

            <div className="flex items-end justify-between">
                <div className="flex items-center border border-stone-100 rounded-none h-10 overflow-hidden shadow-sm">
                    <button 
                        onClick={() => updateCartQuantity(item.id, item.size, item.quantity - 1)} 
                        className="w-10 h-full flex items-center justify-center text-stone-400 hover:text-brand-accent hover:bg-brand-offwhite transition"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-xs lg:text-sm font-bold text-stone-900">{item.quantity}</span>
                    <button 
                        onClick={() => updateCartQuantity(item.id, item.size, item.quantity + 1)} 
                        className="w-10 h-full flex items-center justify-center text-stone-400 hover:text-brand-accent hover:bg-brand-offwhite transition"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] lg:text-[11px] font-bold text-[#b7b7b7] uppercase tracking-widest mb-1">Price</span>
                    <span className="text-xl font-bold text-stone-900 tracking-tighter">৳{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    </motion.div>
);

const CartSkeleton: React.FC = () => (
    <main className="pt-24 sm:pt-40 pb-24 max-w-[1750px] mx-auto px-6 sm:px-12 lg:px-24">
        <div className="flex flex-col items-center mb-24">
            <Skeleton className="h-3 w-32 mb-6" />
            <Skeleton className="h-16 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            <div className="lg:col-span-8 space-y-12">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-6 py-8 border-b border-stone-100">
                        <Shimmer className="w-24 sm:w-32 aspect-[3/4]" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-3 w-32" />
                            <div className="flex justify-between pt-10">
                                <Skeleton className="h-10 w-32 rounded-full" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="lg:col-span-4">
                <Shimmer className="h-[400px] w-full rounded-[2rem]" />
            </div>
        </div>
    </main>
);

const CartPage: React.FC = () => {
  const { cart, updateCartQuantity, navigate, cartTotal, products, loading, ensureAllProductsLoaded, fullProductsLoaded } = useAppStore(state => ({
    cart: state.cart,
    updateCartQuantity: state.updateCartQuantity,
    navigate: state.navigate,
    cartTotal: state.cartTotal,
    products: state.products,
    loading: state.loading,
    ensureAllProductsLoaded: state.ensureAllProductsLoaded,
    fullProductsLoaded: state.fullProductsLoaded
  }));

  const [gtmFired, setGtmFired] = useState(false);
  const orderSummaryRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
      if (!fullProductsLoaded) {
          ensureAllProductsLoaded();
      }
  }, [fullProductsLoaded, ensureAllProductsLoaded]);

  useEffect(() => {
    if (!loading && cart && cart.length > 0 && !gtmFired) {
        setGtmFired(true);
    }
  }, [cart, cartTotal, loading, products, fullProductsLoaded, gtmFired]);

  useEffect(() => {
    // Only auto-scroll on tablet and mobile phone screens (width < 1024px)
    if (typeof window === 'undefined' || window.innerWidth >= 1024) {
      return;
    }

    if (hasScrolledRef.current) return;
    if (loading || !cart || cart.length === 0) return;

    let animFrameId: number | null = null;
    let isInterrupted = false;

    const onUserInteraction = () => {
      isInterrupted = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      removeInteractionListeners();
    };

    const addInteractionListeners = () => {
      window.addEventListener('touchstart', onUserInteraction, { passive: true });
      window.addEventListener('touchmove', onUserInteraction, { passive: true });
      window.addEventListener('wheel', onUserInteraction, { passive: true });
      window.addEventListener('pointerdown', onUserInteraction, { passive: true });
    };

    const removeInteractionListeners = () => {
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('touchmove', onUserInteraction);
      window.removeEventListener('wheel', onUserInteraction);
      window.removeEventListener('pointerdown', onUserInteraction);
    };

    const timerId = setTimeout(() => {
      if (!orderSummaryRef.current || hasScrolledRef.current) return;

      const element = orderSummaryRef.current;
      const elementRect = element.getBoundingClientRect();
      const startPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
      const absoluteElementTop = elementRect.top + startPosition;
      const middleOffset = (window.innerHeight / 2) - (element.offsetHeight / 2);
      const targetPosition = Math.max(0, absoluteElementTop - (middleOffset > 0 ? middleOffset : 20));

      const distance = targetPosition - startPosition;
      if (Math.abs(distance) < 20) return;

      hasScrolledRef.current = true;
      addInteractionListeners();

      const duration = 2900; // 2.9 seconds smooth auto-scroll with gentle landing
      let startTime: number | null = null;

      // Feather-smooth ease-in-out cubic curve
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (currentTime: number) => {
        if (isInterrupted) {
          removeInteractionListeners();
          return;
        }
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        window.scrollTo(0, startPosition + distance * easedProgress);

        if (progress < 1) {
          animFrameId = requestAnimationFrame(step);
        } else {
          removeInteractionListeners();
        }
      };

      animFrameId = requestAnimationFrame(step);
    }, 400);

    return () => {
      clearTimeout(timerId);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      removeInteractionListeners();
    };
  }, [loading, cart]);

  if (loading) return <CartSkeleton />;

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-brand-offwhite rounded-none flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-10 h-10 text-brand-accent" strokeWidth={1} />
          </div>
          <h2 className="font-product text-3xl sm:text-4xl font-medium text-stone-900 mb-6">Your bag is empty</h2>
          <p className="text-[11px] font-bold text-[#b7b7b7] uppercase tracking-[0.3em] leading-loose mb-10">
              It looks like you haven't added any SAZO pieces to your collection yet.
          </p>
          <button onClick={() => navigate('/shop')} className="group relative px-12 py-5 overflow-hidden rounded-none transition-all">
              <div className="absolute inset-0 bg-stone-900 transition-transform duration-500 translate-y-full group-hover:translate-y-0"></div>
              <div className="absolute inset-0 border border-stone-200 rounded-none group-hover:border-transparent transition-all"></div>
              <span className="relative z-10 text-stone-900 group-hover:text-white font-bold uppercase tracking-[0.255em] text-[10px] lg:text-[11px]">Discover Showcase</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 sm:pt-40 pb-24 max-w-[1750px] mx-auto px-6 sm:px-12 lg:px-24">
      <div className="flex flex-col items-center mb-16 sm:mb-24">
          <span className="text-[10px] lg:text-[11px] font-bold text-brand-accent uppercase tracking-[0.35em] mb-4 sm:mb-6">Your Edit</span>
          <h2 className="text-4xl sm:text-6xl font-product font-medium text-stone-900">Shopping Bag</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 items-start">
        <div className="lg:col-span-8">
            <div className="border-t border-stone-100">
                {cart.map(item => <CartItemComponent key={`${item.id}-${item.size}`} item={item} updateCartQuantity={updateCartQuantity} />)}
            </div>
            
            <button 
                onClick={() => navigate('/shop')} 
                className="mt-6 sm:mt-12 flex items-center gap-3 text-[10px] lg:text-[11px] font-bold text-stone-400 uppercase tracking-widest hover:text-brand-accent transition-colors"
            >
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
            </button>
        </div>

        <div className="lg:col-span-4 lg:sticky top-32">
            <div ref={orderSummaryRef} className="bg-white border border-stone-200/60 rounded-none p-5 sm:p-10 md:p-12 shadow-sm">
                <h3 className="font-product text-2xl sm:text-3xl font-medium text-stone-900 mb-10">Order Summary</h3>
                
                <div className="space-y-6 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-10 pb-10 border-b border-stone-200/50">
                    <div className="flex justify-between items-center">
                        <span className="whitespace-nowrap">Subtotal</span>
                        <span className="text-stone-900 whitespace-nowrap">৳{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                        <span className="whitespace-nowrap">For Delivery</span>
                        <span className="text-[#b7b7b7] whitespace-nowrap text-right">At Checkout</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-900">
                        <span className="whitespace-nowrap">Total (Est.)</span>
                        <span className="text-2xl tracking-tighter whitespace-nowrap">৳{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/checkout')} 
                    className="w-full bg-stone-900 text-white py-6 rounded-none font-bold uppercase tracking-[0.255em] text-[10px] lg:text-[11px] hover:bg-brand-accent transition-all shadow-xl hover:shadow-brand-accent/20 mb-6 flex items-center justify-center gap-4"
                >
                    <Truck size={18} />
                    <span>Secure Checkout</span>
                </button>
                
                <div className="text-center">
                    <p className="text-[9px] lg:text-[10px] font-bold text-[#b7b7b7] uppercase tracking-widest">Complimentary shipping on orders above ৳5,000</p>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;

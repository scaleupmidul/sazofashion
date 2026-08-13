
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { CheckCircle, ShoppingBag, ArrowRight, Copy, Printer, MapPin, CreditCard, Sparkles } from 'lucide-react';
import { Order } from '../types';
import { motion } from 'motion/react';
import { Skeleton, Shimmer } from '../components/Skeleton';
import { trackPurchase } from '../services/trackingService';

interface ThankYouPageProps {
  orderId: string;
}

const ThankYouPageSkeleton: React.FC = () => (
    <main className="min-h-screen bg-[#faf7f2] pt-32 sm:pt-48 pb-24 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col items-center text-center mb-32 space-y-10">
                <Skeleton className="w-20 h-20 rounded-none" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-20 w-3/4 max-w-2xl" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <Skeleton className="h-16 w-64 rounded-none mt-10" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
                <div className="lg:col-span-7 h-[600px]">
                    <Shimmer className="h-full w-full rounded-none" />
                </div>
                <div className="lg:col-span-5 h-[600px]">
                    <Shimmer className="h-full w-full rounded-none" />
                </div>
            </div>
        </div>
    </main>
);

const ThankYouPage: React.FC<ThankYouPageProps> = ({ orderId }) => {
    const { navigate, notify } = useAppStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || orderId === 'undefined') {
                setError(true);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(false);
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) throw new Error('Order not found');
                const data: Order = await res.json();
                setOrder(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (order) {
            const displayId = String(order.orderId || order.id || orderId);
            const fullName = `${order.firstName || ''} ${order.lastName || ''}`.trim();
            trackPurchase(
                displayId,
                order.cartItems || [],
                order.total || 0,
                {
                    email: order.email || '',
                    phone: order.phone || '',
                    fullName: fullName || order.firstName || '',
                    city: order.city || '',
                    address: order.address || '',
                }
            );
        }
    }, [order, orderId]);

    const handleCopyOrderId = () => {
        const displayId = order?.orderId || order?.id || '';
        navigator.clipboard.writeText(displayId);
        notify("Order ID copied to clipboard", "success");
    };

    if (loading) return <ThankYouPageSkeleton />;
    
    if (error || !order) {
        return (
             <main className="min-h-[90vh] bg-[#faf7f2] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-none flex items-center justify-center mb-10">
                     <ShoppingBag className="w-8 h-8 text-emerald-600/30" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif italic text-brand-charcoal mb-6">Order Statement Lost</h2>
                <p className="text-brand-muted text-xs sm:text-sm uppercase tracking-[0.3em] leading-relaxed max-w-md mb-12">
                    We were unable to retrieve your acquisition record. Please verify your reference or consult our concierge.
                </p>
                <button 
                  onClick={() => navigate('/shop')} 
                  className="px-12 py-5 rounded-none bg-[#c38b7c] text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#b0786a] transition-all shadow-xl shadow-[#c38b7c]/20"
                >
                    Return to Collection
                </button>
            </main>
        );
    }

    const subtotal = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = order.discountAmount || 0;
    const shipping = order.shippingCharge !== undefined ? order.shippingCharge : (order.total + discount - subtotal);
    const displayOrderId = order.orderId || order.id;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
      <main className="min-h-screen bg-[#faf7f2] pt-12 sm:pt-40 pb-12 sm:pb-24 overflow-hidden selection:bg-emerald-100">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-[1200px] mx-auto px-6 sm:px-12 lg:px-24"
        >
            {/* Success Header */}
            <header className="flex flex-col items-center text-center mb-12 sm:mb-24 lg:mb-32">
                <motion.div 
                    variants={itemVariants}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-none bg-emerald-50 flex items-center justify-center mb-6 sm:mb-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-emerald-100"
                >
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" strokeWidth={1} />
                </motion.div>
                
                <motion.span 
                    variants={itemVariants}
                    className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.4em] mb-4 sm:mb-8"
                >
                    Order Confirmed
                </motion.span>
                
                <motion.h1 
                    variants={itemVariants}
                    className="text-3xl sm:text-6xl lg:text-7xl font-serif italic text-brand-charcoal mb-6 sm:mb-10 tracking-tight"
                >
                    Thank You for Your Order
                </motion.h1>
                
                <motion.p 
                    variants={itemVariants}
                    className="text-brand-muted text-xs sm:text-sm uppercase tracking-[0.255em] leading-[2] max-w-2xl px-4"
                >
                    Your order has been received successfully. We’ll send your confirmation details shortly.
                </motion.p>
                
                <motion.div 
                    variants={itemVariants}
                    onClick={handleCopyOrderId}
                    className="mt-8 sm:mt-16 inline-flex items-center gap-6 px-10 py-4 bg-white rounded-none border border-stone-200 cursor-pointer group active:scale-95 transition-all hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/5"
                >
                    <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Order ID:</span>
                    <span className="text-sm font-bold text-brand-charcoal tracking-tight transition-transform group-hover:scale-105">{displayOrderId}</span>
                    <Copy className="w-4 h-4 text-brand-muted group-hover:text-emerald-500 transition-colors" />
                </motion.div>
            </header>

            {/* Tracking Phase */}
            <section className="max-w-2xl mx-auto mb-16 sm:mb-32 relative">
                 <div className="flex justify-between items-center relative z-10 px-2 sm:px-0">
                    {[
                      { label: 'Placed', icon: CheckCircle, active: true },
                      { label: 'Crafting', icon: Sparkles, active: false },
                      { label: 'In Transit', icon: ArrowRight, active: false },
                      { label: 'Arrived', icon: ShoppingBag, active: false }
                    ].map((phase, idx) => (
                      <div key={idx} className={`flex flex-col items-center gap-5 transition-all duration-700 ${phase.active ? 'opacity-100' : 'opacity-30'}`}>
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-none flex items-center justify-center transition-all ${phase.active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-stone-100 text-stone-400'}`}>
                              <phase.icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{phase.label}</span>
                      </div>
                    ))}
                </div>
                {/* Connector Line */}
                <div className="absolute left-0 top-[20px] sm:top-[20px] w-full h-[1px] bg-stone-200 -z-0"></div>
                <div className="absolute left-0 top-[20px] sm:top-[20px] w-[15%] h-[1px] bg-emerald-600 -z-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
                {/* Left Side: Items */}
                <div className="lg:col-span-7 space-y-8 lg:space-y-12 order-2 lg:order-1">
                     <div className="bg-white p-6 sm:p-16 rounded-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] border border-stone-100">
                        <h3 className="text-xl sm:text-2xl font-serif italic text-brand-charcoal mb-8 sm:mb-16">Ordered Items</h3>
                        
                        <div className="space-y-12">
                            {(order.cartItems || []).map((item, index) => (
                                <motion.div 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 + (index * 0.1) }}
                                  key={index} 
                                  className="flex gap-8 sm:gap-12 items-center"
                                >
                                    <div className="w-24 sm:w-32 aspect-[3/4] bg-[#faf7f2] rounded-none overflow-hidden border border-stone-100 group shadow-sm">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg sm:text-xl font-product font-medium text-brand-charcoal mb-3 sm:mb-4">{item.name}</h4>
                                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">
                                            <span className="flex items-center gap-2">Protocol: <span className="text-brand-charcoal">{item.size}</span></span>
                                            <span className="flex items-center gap-2">Units: <span className="text-brand-charcoal">{item.quantity}</span></span>
                                        </div>
                                        <p className="mt-4 text-base font-bold text-brand-charcoal font-sans tracking-tight">৳{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Summary Card */}
                <aside className="lg:col-span-5 space-y-10 order-1 lg:order-2">
                    <div className="bg-white p-6 sm:p-10 lg:p-10 rounded-none border border-stone-200/60 shadow-sm relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        
                        <h3 className="text-xl sm:text-2xl font-serif italic text-brand-charcoal mb-8 sm:mb-16 relative z-10">Order Summary</h3>
                        
                        <div className="space-y-8 sm:space-y-14 relative z-10">
                            {/* Identity/Address */}
                            <div className="flex gap-4 sm:gap-8">
                                <div className="w-10 h-10 rounded-none bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                                    <MapPin className="w-4 h-4 text-brand-muted" strokeWidth={1.5} />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest opacity-60">Shipping Address</p>
                                    <address className="not-italic text-xs sm:text-sm font-medium text-brand-charcoal leading-relaxed uppercase tracking-widest">
                                        {order.firstName} {order.lastName || ''}
                                        <br />
                                        <span className="opacity-80 block mt-2 text-stone-500 font-light">
                                          {order.address}
                                          {order.city && `, ${order.city}`}
                                          <br />
                                          {order.phone}
                                        </span>
                                    </address>
                                </div>
                            </div>

                            {/* Settlement */}
                            <div className="flex gap-4 sm:gap-8">
                                <div className="w-10 h-10 rounded-none bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                                    <CreditCard className="w-4 h-4 text-brand-muted" strokeWidth={1.5} />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest opacity-60">Payment Method</p>
                                    <p className="text-xs sm:text-sm font-medium text-brand-charcoal uppercase tracking-widest">
                                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : `${order.paymentDetails?.method || 'Secured Payment'}`}
                                    </p>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="pt-14 border-t border-stone-100 space-y-5">
                                <div className="flex justify-between text-[10px] font-bold tracking-[0.2em] text-brand-muted uppercase">
                                    <span>Subtotal</span>
                                    <span className="text-brand-charcoal">৳{subtotal.toLocaleString()}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">
                                        <span>Privilege Bonus</span>
                                        <span>-৳{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[10px] font-bold tracking-[0.2em] text-brand-muted uppercase">
                                    <span>Logistics</span>
                                    <span className="text-brand-charcoal">
                                      {order.paymentMethod === 'Online' ? 'PAID' : `৳${shipping.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl sm:text-3xl font-bold text-brand-charcoal pt-8">
                                    <span className="font-serif italic font-medium">Total Amount</span>
                                    <span className="tracking-tight">৳{order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-20 flex flex-col gap-4 relative z-10">
                            <button 
                              onClick={() => navigate('/shop')} 
                              className="group w-full h-[72px] rounded-none bg-[#c38b7c] text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#b0786a] transition-all flex items-center justify-center gap-6 shadow-xl shadow-[#c38b7c]/20"
                            >
                                <span>Continue Shopping</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                            </button>
                            
                            <button 
                              onClick={() => window.print()} 
                              className="w-full h-[60px] rounded-none bg-white border border-stone-200 text-brand-muted text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-stone-50 hover:text-brand-charcoal transition-all flex items-center justify-center gap-4"
                            >
                                <Printer className="w-3.5 h-3.5 opacity-60" />
                                <span>Print Registry</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="fixed bottom-0 left-0 w-full h-1 bg-emerald-600/20" />
        <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] opacity-30 -z-10" />
      </main>
    );
};

export default ThankYouPage;

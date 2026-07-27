
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { LoaderCircle, ChevronDown, Check, ShieldCheck, Lock, ShoppingBag, Search, MapPin, X } from 'lucide-react';
import { trackServerEvent } from '../services/trackingService';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton, Shimmer, TextSkeleton } from '../components/Skeleton';

const BANGLADESH_DISTRICTS = [
  { en: "Bagerhat", bn: "বাগেরহাট" },
  { en: "Bandarban", bn: "বান্দরবান" },
  { en: "Barguna", bn: "বরগুনা" },
  { en: "Barishal", bn: "বরিশাল" },
  { en: "Bhola", bn: "ভোলা" },
  { en: "Bogura", bn: "বগুড়া" },
  { en: "Brahmanbaria", bn: "ব্রাহ্মণবাড়িয়া" },
  { en: "Chandpur", bn: "চাঁদপুর" },
  { en: "Chapainawabganj", bn: "চাঁপাইনবাবগঞ্জ" },
  { en: "Chattogram", bn: "চট্টগ্রাম" },
  { en: "Chuadanga", bn: "চুয়াডাঙ্গা" },
  { en: "Cumilla", bn: "কুমিল্লা" },
  { en: "Cox's Bazar", bn: "কক্সবাজার" },
  { en: "Dhaka", bn: "ঢাকা" },
  { en: "Dinajpur", bn: "দিনাজপুর" },
  { en: "Faridpur", bn: "ফরিদপুর" },
  { en: "Feni", bn: "ফেনী" },
  { en: "Gaibandha", bn: "গাইবান্ধা" },
  { en: "Gazipur", bn: "গাজীপুর" },
  { en: "Gopalganj", bn: "গোপালগঞ্জ" },
  { en: "Habiganj", bn: "হবিগঞ্জ" },
  { en: "Jamalpur", bn: "জামালপুর" },
  { en: "Jashore", bn: "যশোর" },
  { en: "Jhalokati", bn: "ঝালকাঠি" },
  { en: "Jhenaidah", bn: "ঝিনাইদহ" },
  { en: "Joypurhat", bn: "জয়পুরহাট" },
  { en: "Khagrachhari", bn: "খাগড়াছড়ি" },
  { en: "Khulna", bn: "খুলনা" },
  { en: "Kishoreganj", bn: "কিশোরগঞ্জ" },
  { en: "Kurigram", bn: "কুড়িগ্রাম" },
  { en: "Kushtia", bn: "কুষ্টিয়া" },
  { en: "Lakshmipur", bn: "লক্ষ্মীপুর" },
  { en: "Lalmonirhat", bn: "লালমনিরহাট" },
  { en: "Madaripur", bn: "মাদারীপুর" },
  { en: "Magura", bn: "মাগুরা" },
  { en: "Manikganj", bn: "মানিকগঞ্জ" },
  { en: "Meherpur", bn: "মেহেরপুর" },
  { en: "Moulvibazar", bn: "মৌলভীবাজার" },
  { en: "Munshiganj", bn: "মুন্সীগঞ্জ" },
  { en: "Mymensingh", bn: "ময়মনসিংহ" },
  { en: "Naogaon", bn: "নওগাঁ" },
  { en: "Narail", bn: "নড়াইল" },
  { en: "Narayanganj", bn: "নারায়ণগঞ্জ" },
  { en: "Narsingdi", bn: "নরসিংদী" },
  { en: "Natore", bn: "নাটোর" },
  { en: "Netrokona", bn: "নেত্রকোনা" },
  { en: "Nilphamari", bn: "নীলফামারী" },
  { en: "Noakhali", bn: "নোয়াখালী" },
  { en: "Pabna", bn: "পাবনা" },
  { en: "Panchagarh", bn: "পঞ্চগড়" },
  { en: "Patuakhali", bn: "পটুয়াখালী" },
  { en: "Pirojpur", bn: "পিরোজপুর" },
  { en: "Rajbari", bn: "রাজবাড়ী" },
  { en: "Rajshahi", bn: "রাজশাহী" },
  { en: "Rangamati", bn: "রাঙ্গামাটি" },
  { en: "Rangpur", bn: "রংপুর" },
  { en: "Satkhira", bn: "সাতক্ষীরা" },
  { en: "Shariatpur", bn: "শরীয়তপুর" },
  { en: "Sherpur", bn: "শেরপুর" },
  { en: "Sirajganj", bn: "সিরাজগঞ্জ" },
  { en: "Sunamganj", bn: "সুনামগঞ্জ" },
  { en: "Sylhet", bn: "সিলেট" },
  { en: "Tangail", bn: "টাঙ্গাইল" },
  { en: "Thakurgaon", bn: "ঠাকুরগাঁও" }
].sort((a, b) => a.en.localeCompare(b.en));

const InputField: React.FC<{ 
    label: string; 
    name: string; 
    type?: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; 
    required?: boolean; 
    error?: boolean;
    placeholder?: string;
}> = ({ label, name, type = 'text', value, onChange, required = true, error, placeholder }) => {
    return (
        <div className="flex flex-col space-y-1.5">
          <label htmlFor={name} className="text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">
            {label} {required && <span className="text-brand-accent ml-0.5">*</span>}
          </label>
          <input 
            type={type} 
            id={name} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            required={required}
            placeholder={placeholder}
            className={`w-full px-5 py-4 border rounded-none outline-none transition-all duration-500 bg-white text-brand-charcoal text-xs lg:text-sm font-sans placeholder:text-brand-muted/30
              ${error ? 'border-brand-accent' : 'border-brand-border focus:border-brand-charcoal'} 
            `} 
          />
        </div>
    );
};

const SafeHTML: React.FC<{ content: string; style?: React.CSSProperties }> = ({ content, style }) => {
    try {
        if (!content) return null;
        return (
            <div
                className="font-medium text-brand-charcoal text-xs whitespace-pre-wrap"
                style={style}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    } catch (e) {
        return <div className="font-medium text-brand-charcoal text-xs whitespace-pre-wrap" style={style}>{content}</div>;
    }
};

const CheckoutSkeleton: React.FC = () => (
    <div className="bg-brand-offwhite min-h-screen">
      <main className="container-luxury pt-[10rem] pb-60">
        <div className="flex flex-col mb-12 md:mb-32">
            <Skeleton className="h-3 w-40 mb-6 opacity-40" />
            <Skeleton className="h-20 w-full max-w-2xl" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 xl:gap-32">
            <div className="lg:col-span-7 space-y-20 order-2 lg:order-1">
                <section className="space-y-12 bg-white p-10 border border-brand-border">
                    <Skeleton className="h-10 w-full border-b border-brand-border pb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="md:col-span-2 space-y-4">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-14 w-full rounded-none" />
                        </div>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-14 w-full rounded-none" />
                            </div>
                        ))}
                    </div>
                </section>
                <section className="space-y-12 bg-white p-10 border border-brand-border">
                    <Skeleton className="h-10 w-full border-b border-brand-border pb-4" />
                    <div className="space-y-6">
                        <Skeleton className="h-24 w-full rounded-none" />
                        <Skeleton className="h-24 w-full rounded-none opacity-40" />
                    </div>
                </section>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-10">
                <div className="bg-stone-900/5 p-10 border border-brand-border space-y-10">
                    <Skeleton className="h-10 w-48" />
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-6">
                                <Shimmer className="w-20 h-24 flex-shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-10 border-t border-brand-border space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex justify-between pt-4">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
);

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, navigate, clearCart, notify, addOrder, settings: storeSettings, loading, products, ensureAllProductsLoaded, fullProductsLoaded } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [isAttempted, setIsAttempted] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  
  useEffect(() => {
      if (!fullProductsLoaded) {
          ensureAllProductsLoaded();
      }
  }, [fullProductsLoaded, ensureAllProductsLoaded]);

  const safeSettings = useMemo(() => {
      if (!storeSettings) {
          return {
            codEnabled: true,
            onlinePaymentEnabled: true,
            shippingOptions: [],
            onlinePaymentMethods: [],
            onlinePaymentInfo: '',
            freeShippingEnabled: false,
            exitIntentCouponCode: '',
            exitIntentDiscount: 0,
            exitIntentPopupEnabled: false,
          };
      }
      return {
        codEnabled: storeSettings.codEnabled ?? true,
        onlinePaymentEnabled: storeSettings.onlinePaymentEnabled ?? true,
        shippingOptions: Array.isArray(storeSettings.shippingOptions) ? storeSettings.shippingOptions : [],
        onlinePaymentMethods: Array.isArray(storeSettings.onlinePaymentMethods) ? storeSettings.onlinePaymentMethods : [],
        onlinePaymentInfo: typeof storeSettings.onlinePaymentInfo === 'string' ? storeSettings.onlinePaymentInfo : '',
        freeShippingEnabled: storeSettings.freeShippingEnabled ?? false,
        exitIntentCouponCode: storeSettings.exitIntentCouponCode ?? '',
        exitIntentDiscount: storeSettings.exitIntentDiscount ?? 0,
        exitIntentPopupEnabled: storeSettings.exitIntentPopupEnabled ?? false,
      };
  }, [storeSettings]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
    shippingOptionId: '',
    paymentNumber: '',
    onlinePaymentMethod: 'Choose',
    transactionId: '',
  });

  const safeCartTotal = Number.isFinite(cartTotal) ? cartTotal : 0;

  useEffect(() => {
    if (!loading && (!cart || cart.length === 0) && !isSubmittingRef.current) {
      navigate('/shop');
    }
  }, [loading, cart, navigate]);
  
  const isOnlinePaymentVisible = safeSettings.onlinePaymentEnabled;

  useEffect(() => {
    if (loading) return; 
    setFormData(prev => {
        const newData = { ...prev };
        let changed = false;
        const isCodAvailable = safeSettings.codEnabled;
        if (!((prev.paymentMethod === 'COD' && isCodAvailable) || (prev.paymentMethod === 'Online' && isOnlinePaymentVisible))) {
            newData.paymentMethod = isCodAvailable ? 'COD' : (isOnlinePaymentVisible ? 'Online' : 'COD');
            changed = true;
        }
        if (!prev.shippingOptionId && safeSettings.shippingOptions.length > 0) {
            newData.shippingOptionId = safeSettings.shippingOptions[0].id;
            changed = true;
        }
        return changed ? newData : prev;
    });
  }, [safeSettings, loading, isOnlinePaymentVisible]);

  const selectedShippingOption = useMemo(() => {
    if (!safeSettings.shippingOptions || safeSettings.shippingOptions.length === 0) return null;
    return safeSettings.shippingOptions.find(opt => opt.id === formData.shippingOptionId) || safeSettings.shippingOptions[0];
  }, [formData.shippingOptionId, safeSettings.shippingOptions]);

  const shippingCharge = selectedShippingOption?.charge || 0;
  const isOnlinePayment = formData.paymentMethod === 'Online';
  const effectiveShippingCharge = safeSettings.freeShippingEnabled ? 0 : shippingCharge;
  const totalPayable = Math.max(0, safeCartTotal + effectiveShippingCharge - discountAmount);

  const formattedPaymentInfo = useMemo(() => {
      const info = safeSettings.onlinePaymentInfo || '';
      return info.replace(/(<\/?br\s*\/?>)\s*[\r\n]+/gi, '$1');
  }, [safeSettings.onlinePaymentInfo]);
  
  if (loading) return <CheckoutSkeleton />;

  if (!cart || cart.length === 0) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Auto-select shipping option based on city
        if (name === 'city' && safeSettings.shippingOptions.length > 0) {
            const isDhaka = value.toLowerCase().includes('dhaka');
            const matchingOption = safeSettings.shippingOptions.find(opt => 
                isDhaka ? opt.label.toLowerCase().includes('inside dhaka') : opt.label.toLowerCase().includes('outside dhaka') || opt.label.toLowerCase().includes('out side dhaka')
            );
            if (matchingOption) {
                newData.shippingOptionId = matchingOption.id;
            }
        }
        
        return newData;
    });
  };

  const handleCitySelect = (cityName: string) => {
    setFormData(prev => {
        const newData = { ...prev, city: cityName };
        
        // Auto-select shipping option based on city
        if (safeSettings.shippingOptions.length > 0) {
            const isDhaka = cityName.toLowerCase().includes('dhaka');
            const matchingOption = safeSettings.shippingOptions.find(opt => 
                isDhaka ? opt.label.toLowerCase().includes('inside dhaka') : opt.label.toLowerCase().includes('outside dhaka') || opt.label.toLowerCase().includes('out side dhaka')
            );
            if (matchingOption) {
                newData.shippingOptionId = matchingOption.id;
            }
        }
        
        return newData;
    });
  };

  const filteredDistricts = useMemo(() => {
    return BANGLADESH_DISTRICTS.filter(dist => 
        dist.en.toLowerCase().includes(districtSearchQuery.toLowerCase()) ||
        dist.bn.includes(districtSearchQuery)
    );
  }, [districtSearchQuery]);

  const isFormValid = formData.fullName?.trim() && formData.email?.trim() && formData.phone?.trim() && formData.city && formData.address?.trim();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

    if (!isFormValid) {
        setIsAttempted(true);
        notify("All shipping markers must be completed.", "error");
        return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const paymentInfo = {
        paymentMethod: formData.paymentMethod as 'COD' | 'Online',
        paymentDetails: formData.paymentMethod === 'Online' ? {
            paymentNumber: formData.paymentNumber,
            method: formData.onlinePaymentMethod,
            amount: totalPayable,
            transactionId: formData.transactionId
        } : undefined
    };
    
    try {
        const cartForOrder = cart.map(item => {
            const productInStore = products.find(p => p.id === item.id);
            const finalId = item.productId || productInStore?.productId || item.id;
            return { ...item, productId: finalId };
        });
        
        const newOrder = await addOrder(
          { firstName: formData.fullName, lastName: '', email: formData.email, phone: formData.phone, address: formData.address, city: formData.city, note: formData.note },
          cartForOrder,
          totalPayable,
          paymentInfo,
          effectiveShippingCharge,
          discountAmount,
          appliedCoupon
        );
    
        const orderId = newOrder.orderId || newOrder.id;
        if (orderId) {
            clearCart();
            navigate(`/thank-you/${orderId}`);
        }
    } catch (error: any) {
        notify(error.message || "Purchase could not be finalized.", "error");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
    }
  };

  const applyCoupon = () => {
    if (!couponInput.trim()) {
        notify("Please enter a coupon code.", "error");
        return;
    }
    
    // Check against settings coupon if it exists
    if (safeSettings.exitIntentCouponCode && couponInput.toUpperCase() === safeSettings.exitIntentCouponCode.toUpperCase()) {
        setDiscountAmount(safeSettings.exitIntentDiscount || 0);
        setAppliedCoupon(safeSettings.exitIntentCouponCode);
        notify(`Coupon applied: ৳${safeSettings.exitIntentDiscount} discount`, "success");
        setIsCouponModalOpen(false);
    } else {
        notify("Invalid coupon code.", "error");
    }
  };

  const removeCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon('');
    notify("Coupon removed.", "info");
  };

  return (
    <div className="bg-brand-offwhite min-h-screen">
      <main className="container-luxury pt-[4.5rem] sm:pt-32 pb-24 sm:pb-36">
        <AnimatePresence>
            {isCouponModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCouponModalOpen(false)}
                        className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white p-10 shadow-3xl rounded-none"
                    >
                        <h3 className="text-xl font-serif font-light italic text-brand-charcoal mb-8 text-center">Exclusive Promo</h3>
                        <p className="text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-[0.2em] mb-6 text-center leading-relaxed">
                            Enter your heritage access code below to unlock special benefits.
                        </p>
                        
                        <div className="space-y-6">
                            <InputField 
                                label="Coupon Code" 
                                name="coupon" 
                                value={couponInput} 
                                onChange={(e) => setCouponInput(e.target.value)} 
                                required 
                                placeholder="SAZO..." 
                            />
                            <button 
                                onClick={applyCoupon}
                                className="w-full h-16 bg-brand-charcoal text-white text-[10px] lg:text-[11px] font-display font-black uppercase tracking-[0.4em] hover:bg-brand-accent transition-all duration-500"
                            >
                                Validate Code
                            </button>
                            <button 
                                onClick={() => setIsCouponModalOpen(false)}
                                className="w-full text-[9px] font-display font-bold text-brand-muted uppercase tracking-widest hover:text-brand-charcoal transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {isDistrictModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setIsDistrictModalOpen(false);
                            setDistrictSearchQuery('');
                        }}
                        className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 15 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-[94vw] sm:max-w-xl md:max-w-2xl bg-[#FDFDFB] border border-brand-charcoal/15 shadow-[0_25px_80px_rgba(0,0,0,0.3)] flex flex-col max-h-[85vh] sm:max-h-[88vh] z-10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 sm:p-7 pb-4 border-b border-brand-border/40 bg-white space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-charcoal leading-tight">
                                        Select Delivery Region
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-brand-muted font-display font-semibold uppercase tracking-[0.2em] mt-1">
                                        শহর / এরিয়া নির্বাচন করুন
                                    </p>
                                    <div className="mt-2">
                                        <span className="inline-block text-[10px] font-display font-bold px-2 py-0.5 bg-brand-offwhite text-brand-accent tracking-widest uppercase border border-brand-accent/20">
                                            {filteredDistricts.length} Cities
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsDistrictModalOpen(false);
                                        setDistrictSearchQuery('');
                                    }}
                                    className="text-brand-muted hover:text-brand-charcoal transition-colors p-2 hover:bg-brand-charcoal/5 rounded-full flex-shrink-0"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search Input Bar */}
                            <div className="relative flex items-center">
                                <Search className="w-4 h-4 text-brand-muted/70 absolute left-3.5 pointer-events-none" />
                                <input
                                    type="text"
                                    value={districtSearchQuery}
                                    onChange={(e) => setDistrictSearchQuery(e.target.value)}
                                    placeholder="Search city or district"
                                    className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-brand-offwhite/80 border border-brand-border/60 text-xs sm:text-sm text-brand-charcoal font-sans placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-charcoal transition-all"
                                    autoFocus
                                />
                                {districtSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setDistrictSearchQuery('')}
                                        className="absolute right-3 text-brand-muted/60 hover:text-brand-charcoal p-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Scrollable List */}
                        <div className="flex-grow overflow-y-auto divide-y divide-brand-border/20 custom-scrollbar-light max-h-[50vh] sm:max-h-[55vh] bg-white">
                            {filteredDistricts.length > 0 ? (
                                filteredDistricts.map(dist => {
                                    const isSelected = formData.city === dist.en;
                                    return (
                                        <button
                                            key={dist.en}
                                            type="button"
                                            onClick={() => {
                                                handleCitySelect(dist.en);
                                                setIsDistrictModalOpen(false);
                                                setDistrictSearchQuery('');
                                            }}
                                            className={`w-full py-3.5 sm:py-4 px-5 sm:px-7 text-left flex items-center justify-between transition-all duration-200 group ${
                                                isSelected 
                                                    ? 'bg-brand-offwhite/90 border-l-4 border-l-brand-accent' 
                                                    : 'hover:bg-brand-offwhite/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className={`p-2 rounded-full transition-colors ${
                                                    isSelected ? 'bg-brand-accent/15 text-brand-accent' : 'bg-brand-offwhite text-brand-muted/50 group-hover:text-brand-charcoal group-hover:bg-brand-border/30'
                                                }`}>
                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className={`text-xs sm:text-sm font-display font-bold uppercase tracking-[0.14em] transition-colors duration-200 ${
                                                        isSelected ? 'text-brand-accent' : 'text-brand-charcoal group-hover:text-brand-accent'
                                                    }`}>
                                                        {dist.en}
                                                    </span>
                                                    <span className="text-[11px] sm:text-xs text-brand-muted/80 leading-tight mt-0.5 font-sans font-medium">
                                                        {dist.bn}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`transition-all duration-200 ${
                                                isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-40 group-hover:scale-100'
                                            }`}>
                                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-brand-accent" strokeWidth={2.5} />
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="py-14 px-6 text-center space-y-3">
                                    <MapPin className="w-8 h-8 text-brand-muted/30 mx-auto" />
                                    <p className="text-sm font-display font-bold uppercase tracking-widest text-brand-charcoal">
                                        No City Found
                                    </p>
                                    <p className="text-xs text-brand-muted font-sans">
                                        No district matches "{districtSearchQuery}". Please check your spelling.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setDistrictSearchQuery('')}
                                        className="text-xs font-display font-bold text-brand-accent uppercase tracking-wider underline underline-offset-4 pt-2"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="px-5 py-3 bg-brand-offwhite/60 border-t border-brand-border/30 flex items-center justify-center text-center text-[10px] sm:text-xs text-brand-muted font-sans">
                            <span>Delivery charge is auto-calculated based on region.</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <div className="flex flex-col mb-8 md:mb-16">
            <span className="text-[9px] lg:text-[10px] font-display font-bold text-brand-accent uppercase tracking-[0.4em] mb-3">Secure Checkout</span>
            <h1 className="text-3xl md:text-6xl font-serif font-light italic text-brand-charcoal">Finalize Collection</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24">
            {/* Form Side */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10 md:space-y-16">
                
                {/* Step 1: Shipping */}
                <section>
                    <div className="flex items-center gap-6 mb-6 md:mb-8 py-3 border-b border-brand-border/50">
                        <span className="text-[10px] lg:text-[11px] font-display font-black text-brand-charcoal uppercase tracking-[0.4em]">01. Shipping</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="md:col-span-2">
                            <InputField label="Full Name (আপনার সম্পূর্ণ নাম)" name="fullName" value={formData.fullName} onChange={handleChange} required error={isAttempted && !formData.fullName.trim()} />
                        </div>
                        <InputField label="Phone Number (মোবাইল নম্বর)" name="phone" type="tel" value={formData.phone} onChange={handleChange} required error={isAttempted && !formData.phone.trim()} placeholder="+880..." />
                        <InputField label="Email Address (ইমেইল অ্যাড্রেস)" name="email" type="email" value={formData.email} onChange={handleChange} required error={isAttempted && !formData.email.trim()} />
                        
                        <div className="md:col-span-2 flex flex-col space-y-1.5">
                            <label htmlFor="city" className="text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">
                                City / Area (শহর / এরিয়া) <span className="text-brand-accent ml-0.5">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDistrictModalOpen(true)}
                                    className={`w-full px-5 py-4 border rounded-none outline-none bg-white text-xs lg:text-sm text-left flex items-center justify-between transition-all duration-500
                                    ${isAttempted && !formData.city 
                                        ? 'border-brand-accent' 
                                        : 'border-brand-border focus-within:border-brand-charcoal hover:border-brand-charcoal/40'}`}
                                >
                                    <span className={`font-sans ${formData.city ? 'text-brand-charcoal font-medium' : 'text-brand-charcoal/30'}`}>
                                        {formData.city ? (
                                            (() => {
                                                const found = BANGLADESH_DISTRICTS.find(d => d.en === formData.city);
                                                return found ? `${found.en} (${found.bn})` : formData.city;
                                            })()
                                        ) : (
                                            "Choose City / Area (শহর / এরিয়া)"
                                        )}
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5 text-brand-charcoal/30" />
                                </button>
                                
                                <select 
                                    id="city" 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    required 
                                    className="sr-only"
                                >
                                    <option value="" disabled>Choose City</option>
                                    {BANGLADESH_DISTRICTS.map(dist => (
                                        <option key={dist.en} value={dist.en}>
                                            {dist.en} ({dist.bn})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col space-y-1.5">
                            <label htmlFor="address" className="text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">
                                Delivery Location (ডেলিভারি লোকেশন) <span className="text-brand-accent ml-0.5">*</span>
                            </label>
                            <textarea id="address" name="address" value={formData.address} onChange={handleChange} required rows={3} placeholder="Apartment, Studio, Street..." 
                                className={`w-full px-5 py-4 border rounded-none outline-none transition-all duration-500 bg-white text-xs lg:text-sm font-medium placeholder:text-brand-muted/30
                                ${isAttempted && !formData.address.trim() ? 'border-brand-accent' : 'border-brand-border focus:border-brand-charcoal'}`}
                            />
                        </div>
                    </div>

                    {!safeSettings.freeShippingEnabled && safeSettings.shippingOptions.length > 0 && (
                        <div className="mt-12 space-y-6">
                            <span className="text-[10px] font-display font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">Shipping Method (ডেলিভারি মাধ্যম)</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {safeSettings.shippingOptions.map((option) => (
                                    <label 
                                        key={option.id}
                                        className={`flex items-center justify-between p-6 border cursor-pointer transition-all duration-500 rounded-none 
                                        ${formData.shippingOptionId === option.id ? 'bg-brand-offwhite border-brand-charcoal' : 'bg-white border-brand-border hover:border-brand-charcoal/30'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="radio" 
                                                name="shippingOptionId" 
                                                value={option.id} 
                                                checked={formData.shippingOptionId === option.id} 
                                                onChange={handleChange}
                                                className="hidden" 
                                            />
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${formData.shippingOptionId === option.id ? 'border-brand-charcoal bg-brand-charcoal' : 'border-brand-border'}`}>
                                                {formData.shippingOptionId === option.id && <div className="w-2 h-2 rounded-full bg-white animate-scale-in"></div>}
                                            </div>
                                            <span className={`text-[10px] font-display font-bold uppercase tracking-widest ${formData.shippingOptionId === option.id ? 'text-brand-charcoal' : 'text-brand-charcoal/60'}`}>{option.label}</span>
                                        </div>
                                        <span className="text-xs font-sans font-bold">৳{option.charge}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Step 2: Payment */}
                <section>
                    <div className="flex items-center gap-6 mb-6 md:mb-8 py-3 border-b border-brand-border/50">
                        <span className="text-[10px] lg:text-[11px] font-display font-black text-brand-charcoal uppercase tracking-[0.4em]">02. Payment</span>
                    </div>

                    <div className="space-y-4">
                        {safeSettings.codEnabled && (
                            <label className={`block group p-8 border cursor-pointer transition-all duration-500 ${formData.paymentMethod === 'COD' ? 'bg-brand-offwhite border-brand-charcoal' : 'bg-white border-brand-border hover:border-brand-charcoal/30'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} className="hidden" />
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.paymentMethod === 'COD' ? 'border-brand-charcoal bg-brand-charcoal' : 'border-brand-border'}`}>
                                            {formData.paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-white animate-scale-in"></div>}
                                        </div>
                                        <div>
                                            <h4 className={`text-[11px] lg:text-xs font-display font-bold uppercase tracking-widest leading-none mb-1 ${formData.paymentMethod === 'COD' ? 'text-brand-charcoal' : 'text-brand-charcoal/60'}`}>Cash on Delivery</h4>
                                        </div>
                                    </div>
                                    <Check className={`w-4 h-4 text-brand-charcoal transition-all duration-500 ${formData.paymentMethod === 'COD' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                </div>
                            </label>
                        )}

                        {isOnlinePaymentVisible && (
                            <div className={`border transition-all duration-500 ${formData.paymentMethod === 'Online' ? 'bg-brand-offwhite border-brand-charcoal' : 'bg-white border-brand-border hover:border-brand-charcoal/30'}`}>
                                <label className="block p-8 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <input type="radio" name="paymentMethod" value="Online" checked={formData.paymentMethod === 'Online'} onChange={handleChange} className="hidden" />
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.paymentMethod === 'Online' ? 'border-brand-charcoal bg-brand-charcoal' : 'border-brand-border'}`}>
                                                {formData.paymentMethod === 'Online' && <div className="w-2.5 h-2.5 rounded-full bg-white animate-scale-in"></div>}
                                            </div>
                                            <div>
                                                <h4 className={`text-[11px] lg:text-xs font-display font-bold uppercase tracking-widest leading-none mb-1 ${formData.paymentMethod === 'Online' ? 'text-brand-charcoal' : 'text-brand-charcoal'}`}>Digital Transfer</h4>
                                                <p className={`text-[9px] lg:text-[10px] uppercase tracking-widest ${formData.paymentMethod === 'Online' ? 'text-brand-charcoal/60' : 'text-brand-muted/40'}`}>Verified Merchant Gateway</p>
                                            </div>
                                        </div>
                                        <Check className={`w-4 h-4 text-brand-charcoal transition-all duration-500 ${formData.paymentMethod === 'Online' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                    </div>
                                </label>

                                <AnimatePresence>
                                    {formData.paymentMethod === 'Online' && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="px-8 pb-8 overflow-hidden"
                                        >
                                            <div className="pt-8 border-t border-brand-charcoal/10 space-y-10">
                                                <div className="p-6 bg-white border border-brand-border flex flex-col gap-4">
                                                    <SafeHTML content={formattedPaymentInfo} style={{ color: '#1a1a1a', opacity: 0.8 }} />
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="md:col-span-2 space-y-4">
                                                        <span className="text-[9px] lg:text-[10px] font-display font-bold text-brand-muted uppercase tracking-widest block ml-1">Method Selection</span>
                                                        <div className="flex flex-wrap gap-3">
                                                            {safeSettings.onlinePaymentMethods.map(method => (
                                                                <button key={method} type="button" onClick={() => setFormData(p => ({ ...p, onlinePaymentMethod: method }))}
                                                                    className={`px-6 py-4 border rounded-none text-[9px] lg:text-[10px] font-display font-bold uppercase tracking-[0.2em] transition-all duration-500 ${formData.onlinePaymentMethod === method ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-white text-brand-muted border-brand-border hover:border-brand-charcoal'}`}
                                                                >
                                                                    {method}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col space-y-1.5">
                                                        <label className="text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">Sender Signature (Phone)</label>
                                                        <input type="tel" name="paymentNumber" value={formData.paymentNumber} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-brand-border rounded-none outline-none text-xs lg:text-sm text-brand-charcoal focus:border-brand-charcoal transition-all font-sans" placeholder="01XXX..." />
                                                    </div>
                                                    <div className="flex flex-col space-y-1.5">
                                                        <label className="text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">Transaction Identity</label>
                                                        <input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-brand-border rounded-none outline-none text-xs lg:text-sm text-brand-charcoal focus:border-brand-charcoal transition-all font-sans" placeholder="Ref ID..." />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </section>

                {/* Mobile / Tablet Order Summary (shows below 02. Payment and above Purchase button) */}
                <div className="block lg:hidden my-8 sm:my-12">
                    <div className="bg-brand-charcoal p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <ShieldCheck size={100} strokeWidth={0.5} />
                        </div>
                        
                        <h3 className="font-serif text-2xl italic mb-8">Order Summary</h3>
                        
                        <div className={`space-y-8 mb-12 pr-2 custom-scrollbar-light ${cart.length > 2 ? 'max-h-[280px] overflow-y-auto' : 'max-h-none overflow-visible'}`}>
                            {cart.map((item) => (
                                <div key={`mob-${item.id}-${item.size}`} className="flex gap-6 items-center group">
                                    <div className="w-14 h-18 flex-shrink-0 bg-white/5 overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[11px] font-display font-bold uppercase tracking-[0.2em] mb-1 truncate">{item.name}</h4>
                                        <p className="text-[9px] text-white/40 uppercase tracking-[0.3em]">{item.size} &bull; Qty: {item.quantity}</p>
                                        <p className="text-xs font-sans mt-2 tracking-tighter">৳{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-5 pt-8 border-t border-white/10">
                            {appliedCoupon ? (
                                <div className="flex justify-between items-center group">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-display font-bold text-brand-accent uppercase tracking-[0.3em]">Code Applied</span>
                                        <span className="text-[11px] text-white font-display font-bold uppercase tracking-widest">{appliedCoupon}</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={removeCoupon}
                                        className="text-[9px] font-display font-bold text-white/40 hover:text-brand-accent uppercase tracking-widest transition-colors underline underline-offset-4"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : safeSettings.exitIntentPopupEnabled ? (
                                <button 
                                    type="button"
                                    onClick={() => setIsCouponModalOpen(true)}
                                    className="w-full py-3.5 border border-white/10 flex items-center justify-center gap-3 text-[10px] font-display font-bold text-white/50 uppercase tracking-[0.3em] hover:text-white hover:border-white/30 transition-all group"
                                >
                                    <span>Have a promo code?</span>
                                </button>
                            ) : null}
                            
                            <div className="flex justify-between items-center text-[10px] font-display font-bold uppercase tracking-[0.3em] text-white/50">
                                <span>Collection Value</span>
                                <span className="text-white">৳{safeCartTotal.toLocaleString()}</span>
                            </div>
                            
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-display font-bold uppercase tracking-[0.3em] text-brand-accent">
                                    <span>Promo Discount</span>
                                    <span>-৳{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/50">
                                <span className="whitespace-nowrap">For Delivery</span>
                                <span className={effectiveShippingCharge === 0 ? 'text-brand-accent whitespace-nowrap' : 'text-white whitespace-nowrap'}>
                                    {effectiveShippingCharge === 0 ? 'Complimentary' : `৳${effectiveShippingCharge.toLocaleString()}`}
                                </span>
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-white/20 flex justify-between items-center">
                                <span className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-white/60">Total Payable</span>
                                <span className="text-xl font-sans font-bold tracking-tighter">৳{totalPayable.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 md:pt-8 pb-12 sm:pb-16 md:pb-20">
                    <button type="submit" disabled={isSubmitting} className="luxury-button w-full h-14 sm:h-16 md:h-18 group flex items-center justify-center gap-3.5 shadow-lg hover:shadow-xl transition-all">
                        {isSubmitting ? (
                            <LoaderCircle className="w-5 h-5 animate-spin text-white" />
                        ) : (
                            <>
                                <span className="font-display font-black uppercase tracking-[0.32em] text-xs sm:text-sm">
                                    Purchase
                                </span>
                                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-brand-accent group-hover:scale-110 transition-transform duration-300" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Receipt Side (Desktop) */}
            <div className="hidden lg:block lg:col-span-5 pt-8 lg:pt-0">
                <div className="lg:sticky lg:top-40 space-y-12">
                    <div className="bg-brand-charcoal p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <ShieldCheck size={120} strokeWidth={0.5} />
                        </div>
                        
                        <h3 className="font-serif text-3xl italic mb-12">Order Summary</h3>
                        
                        <div className={`space-y-10 mb-16 pr-4 custom-scrollbar-light ${cart.length > 2 ? 'max-h-[280px] overflow-y-auto md:max-h-[350px]' : 'max-h-none overflow-visible md:max-h-[350px] md:overflow-y-auto'}`}>
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.size}`} className="flex gap-8 items-center group">
                                    <div className="w-16 h-20 flex-shrink-0 bg-white/5 overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-80" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[11px] lg:text-xs font-display font-bold uppercase tracking-[0.2em] mb-1 truncate">{item.name}</h4>
                                        <p className="text-[9px] lg:text-[10px] text-white/40 uppercase tracking-[0.3em]">{item.size} &bull; Qty: {item.quantity}</p>
                                        <p className="text-xs lg:text-sm font-sans mt-3 tracking-tighter">৳{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6 pt-10 border-t border-white/10">
                            {appliedCoupon ? (
                                <div className="flex justify-between items-center group">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-display font-bold text-brand-accent uppercase tracking-[0.3em]">Code Applied</span>
                                        <span className="text-[11px] text-white font-display font-bold uppercase tracking-widest">{appliedCoupon}</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={removeCoupon}
                                        className="text-[9px] font-display font-bold text-white/40 hover:text-brand-accent uppercase tracking-widest transition-colors underline underline-offset-4"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : safeSettings.exitIntentPopupEnabled ? (
                                <button 
                                    type="button"
                                    onClick={() => setIsCouponModalOpen(true)}
                                    className="w-full py-4 border border-white/10 flex items-center justify-center gap-3 text-[10px] font-display font-bold text-white/50 uppercase tracking-[0.3em] hover:text-white hover:border-white/30 transition-all group"
                                >
                                    <span>Have a promo code?</span>
                                </button>
                            ) : null}
                            
                            <div className="flex justify-between items-center text-[10px] lg:text-[11px] font-display font-bold uppercase tracking-[0.3em] text-white/50">
                                <span>Collection Value</span>
                                <span className="text-white">৳{safeCartTotal.toLocaleString()}</span>
                            </div>
                            
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-[10px] lg:text-[11px] font-display font-bold uppercase tracking-[0.3em] text-brand-accent">
                                    <span>Promo Discount</span>
                                    <span>-৳{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] lg:text-[11px] font-display font-bold uppercase tracking-[0.2em] text-white/50">
                                <span className="whitespace-nowrap">For Delivery</span>
                                <span className={effectiveShippingCharge === 0 ? 'text-brand-accent whitespace-nowrap' : 'text-white whitespace-nowrap'}>
                                    {effectiveShippingCharge === 0 ? 'Complimentary' : `৳${effectiveShippingCharge.toLocaleString()}`}
                                </span>
                            </div>
                            
                            <div className="mt-12 pt-10 border-t border-white/20 flex justify-between items-center">
                                <span className="text-[10px] lg:text-[11px] font-display font-black uppercase tracking-[0.4em] text-white/60">Total Payable</span>
                                <span className="text-2xl font-sans font-bold tracking-tighter">৳{totalPayable.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

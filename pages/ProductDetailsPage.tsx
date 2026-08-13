
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Product } from '../types';
import { trackViewContent } from '../services/trackingService';
import { ShoppingCart, ChevronLeft, ChevronRight, Share2, Plus, Minus, ChevronDown, Truck, ShieldCheck, CreditCard, RefreshCw, X, Ruler, Info } from 'lucide-react';
import { useAppStore } from '../store';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Skeleton, Shimmer, TextSkeleton } from '../components/Skeleton';

const SizeGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { settings } = useAppStore();
  const rows = settings.sizeGuide?.length > 0 ? settings.sizeGuide : [
    { size: 'S', chest: '36', waist: '30', length: '40' },
    { size: 'M', chest: '38', waist: '32', length: '41' },
    { size: 'L', chest: '40', waist: '34', length: '42' },
    { size: 'XL', chest: '42', waist: '36', length: '43' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pt-20 sm:pt-24 pb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg bg-white p-6 md:p-10 overflow-y-auto max-h-[80vh] shadow-2xl custom-scrollbar-light my-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-charcoal transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-8 md:space-y-10">
              <div>
                <span className="text-[10px] lg:text-[11px] font-display font-bold text-brand-accent uppercase tracking-[0.5em] mb-4 block">Standard Sizing</span>
                <h2 className="text-2xl md:text-3xl font-serif italic text-brand-charcoal">Size Guide</h2>
              </div>

              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-left border-collapse min-w-[300px]">
                  <thead>
                    <tr className="border-b border-brand-border">
                      <th className="py-4 text-[9px] md:text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-widest px-2">Size</th>
                      <th className="py-4 text-[9px] md:text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-widest px-2">Chest (in)</th>
                      <th className="py-4 text-[9px] md:text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-widest px-2">Waist (in)</th>
                      <th className="py-4 text-[9px] md:text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-widest px-2">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30">
                    {rows.map((row: any, i: number) => (
                      <tr key={i} className="group">
                        <td className="py-4 md:py-5 text-[11px] md:text-xs lg:text-sm font-bold text-brand-charcoal px-2">{row.size || row.s}</td>
                        <td className="py-4 md:py-5 text-[11px] md:text-xs lg:text-sm text-brand-muted px-2">{row.chest || row.c}</td>
                        <td className="py-4 md:py-5 text-[11px] md:text-xs lg:text-sm text-brand-muted px-2">{row.waist || row.w}</td>
                        <td className="py-4 md:py-5 text-[11px] md:text-xs lg:text-sm text-brand-muted px-2">{row.length || row.l}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 md:p-6 bg-stone-50 space-y-3">
                <p className="text-[9px] md:text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-[0.1em] flex items-center gap-2"><Info className="w-3 h-3" /> Measuring Advice</p>
                <p className="text-[10px] md:text-[11px] lg:text-[12px] text-brand-muted leading-relaxed">For the most accurate fit, measure yourself over undergarments and compare to our guide. If you are between sizes, we recommend selecting the larger size for a relaxed drape.</p>
              </div>

              <button 
                onClick={onClose}
                className="w-full h-12 md:h-14 bg-brand-charcoal text-white text-[10px] font-display font-bold uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-[0.98]"
              >
                Return to product
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
        <div className="border-b border-brand-border last:border-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full py-6 flex justify-between items-center text-left transition group"
      >
        <span className="text-xs lg:text-sm font-display font-medium text-brand-muted uppercase tracking-[0.11em] group-hover:text-brand-charcoal transition-colors">{title}</span>
        <ChevronDown className={`w-3 h-3 text-brand-muted transition-transform duration-700 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="text-brand-charcoal text-xs sm:text-sm leading-relaxed tracking-wide pb-8 font-light">
                {children}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductSkeleton: React.FC = () => (
  <div className="bg-white pb-32">
    <main className="container-luxury pt-32 md:pt-48">
      <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 items-start">
        <div className="w-full lg:col-span-6 space-y-12">
          <div className="bg-stone-50 overflow-hidden">
            <Shimmer className="aspect-[3/4] w-full" />
          </div>
          <div className="grid grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-stone-50 overflow-hidden">
                    <Shimmer className="aspect-[1/1] w-full" />
                </div>
            ))}
          </div>
          <div className="pt-12">
             <Skeleton className="h-4 w-32 mb-8 opacity-40" />
             <div className="grid grid-cols-4 gap-4">
                 {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
             </div>
          </div>
        </div>
        <div className="w-full lg:col-span-6 pt-10 lg:pt-0 space-y-16">
          <div className="space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-3 w-32 opacity-40" />
                <Skeleton className="h-16 w-full" />
            </div>
            <div className="flex items-baseline gap-6 pt-6">
               <Skeleton className="h-10 w-40" />
               <Skeleton className="h-6 w-32 opacity-20" />
            </div>
          </div>
          
          <div className="space-y-8">
            <Skeleton className="h-16 w-full rounded-full" />
            <div className="space-y-4 pt-10">
                <Skeleton className="h-4 w-32 opacity-40 ml-1" />
                <Skeleton className="h-32 w-full opacity-60" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-10">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>

          <div className="space-y-8 pt-16 border-t border-stone-100">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-8" />
                </div>
             ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);

const ProductParallaxGallery: React.FC<{ 
  images: string[]; 
  currentIndex: number; 
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
}> = ({ images, currentIndex, setCurrentImageIndex }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [direction, setDirection] = useState(1);
    const prevIndexRef = useRef(currentIndex);

    useEffect(() => {
        if (currentIndex >= images.length && images.length > 0) {
            setCurrentImageIndex(0);
        }
    }, [images.length, currentIndex, setCurrentImageIndex]);

    useEffect(() => {
        const prev = prevIndexRef.current;
        if (prev !== currentIndex && images.length > 0) {
            let dir = 1;
            if (prev === images.length - 1 && currentIndex === 0) {
                dir = 1; // Continuous forward loop
            } else if (prev === 0 && currentIndex === images.length - 1) {
                dir = -1; // Continuous backward loop
            } else if (currentIndex < prev) {
                dir = -1;
            } else {
                dir = 1;
            }
            setDirection(dir);
            prevIndexRef.current = currentIndex;
        }
    }, [currentIndex, images.length]);

    // Auto-slide logic
    useEffect(() => {
        if (images.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        }, 4500);
        
        return () => clearInterval(interval);
    }, [images.length, setCurrentImageIndex]);

    const handleDragEnd = (_event: any, info: any) => {
        if (images.length <= 1) return;
        
        const swipeThreshold = 25;
        const velocityThreshold = 180;
        if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
            setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
            setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
        }
    };

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? '100%' : '-100%',
            opacity: 1
        }),
        center: {
            x: '0%',
            opacity: 1
        },
        exit: (dir: number) => ({
            x: dir > 0 ? '-100%' : '100%',
            opacity: 1
        })
    };

    const safeIndex = (currentIndex >= 0 && currentIndex < images.length) ? currentIndex : 0;

    return (
        <div ref={ref} className="relative aspect-[3/4] overflow-hidden bg-[#f3f0ea] select-none touch-pan-y rounded-sm group">
            {/* Elegant Shimmer Background */}
            <div className="absolute inset-0 bg-[#f3f0ea] flex items-center justify-center pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-stone-100 via-stone-200/50 to-stone-100 bg-[length:200%_100%] animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-[#C38B7C]/5 filter blur-3xl" />
            </div>

            {images.length > 0 ? (
                <div className="relative w-full h-full overflow-hidden">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={`${images[safeIndex]}-${safeIndex}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 280, damping: 30, mass: 0.8 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing will-change-transform"
                        >
                            <img 
                                src={images[safeIndex]} 
                                className="w-full h-full object-cover pointer-events-none select-none" 
                                referrerPolicy="no-referrer"
                                alt={`Product image ${safeIndex + 1}`}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                <div className="absolute inset-0 bg-[#f3f0ea] flex items-center justify-center">
                    <span className="text-[10px] font-display uppercase tracking-[0.2em] text-brand-muted/40">No Image Available</span>
                </div>
            )}

            {/* Pagination dots indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setCurrentImageIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-500 ease-out ${safeIndex === i ? 'bg-white w-5' : 'bg-white/40 w-1.5 hover:bg-white/80'}`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductDetailsPage: React.FC = () => {
  const { product, navigate, addToCart, notify, loading, refreshProduct, path } = useAppStore(state => ({
    product: state.selectedProduct,
    navigate: state.navigate,
    addToCart: state.addToCart,
    notify: state.notify,
    loading: state.loading,
    refreshProduct: state.refreshProduct,
    path: state.path
  }));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  
  const isOutOfStock = product?.isOutOfStock ?? false;

  useEffect(() => {
    let isMounted = true;
    const fetchProductData = async () => {
        const pathParts = path.split('/');
        const rawId = pathParts[pathParts.length - 1];
        const pathId = rawId ? rawId.split('?')[0] : '';
        
        if (pathId && pathId !== 'product') {
             setIsFetching(true);
             await refreshProduct(pathId);
        }
        if (isMounted) setIsFetching(false);
    };

    fetchProductData();
    return () => { isMounted = false; };
  }, [path, refreshProduct]);

  const images = useMemo(() => {
    if (!product || !product.images) return [];
    return product.images.filter(img => img && img !== "");
  }, [product]);

  const sizes = useMemo(() => product?.sizes || [], [product]);

  useEffect(() => {
    if (product && sizes.length === 1) {
        setSelectedSize(sizes[0]);
    }
  }, [product, sizes]);

  const trackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (product) {
        setCurrentImageIndex(0);
        window.scrollTo(0, 0); 
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        if (trackedPathRef.current !== path) {
            trackedPathRef.current = path;
            trackViewContent(product);
        }
    }
  }, [product, path]);

  const validateSelection = () => {
      if (isOutOfStock) return false;
      if (!selectedSize) {
        notify("Please choose your preferred size.", "error"); 
        return false;
    }
    if (!product) return false;
    return true;
  }

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    if (!product) return;
    addToCart(product, quantity, selectedSize!);
    notify("Item added to your cart.", "success");
    navigate('/cart');
  };

  const handleBuyNow = () => {
      if (!validateSelection()) return;
      if (!product) return;
      addToCart(product, quantity, selectedSize!);
      navigate('/checkout');
  }

  if ((loading || isFetching) && !product) return <ProductSkeleton />;
  
  if (!product) return null;

  return (
    <div className="bg-brand-offwhite pb-32"> 
      <main className="container-luxury pt-24 md:pt-32">
        {/* Elegant Minimal Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[0.2em] text-brand-muted uppercase mb-8 font-normal">
            <button onClick={() => navigate('/')} className="hover:text-brand-accent transition-colors">Home</button>
            <span className="text-stone-300">/</span>
            <button onClick={() => navigate('/shop')} className="hover:text-brand-accent transition-colors">Collections</button>
            {product.category && (
                <>
                    <span className="text-stone-300">/</span>
                    <button onClick={() => navigate(`/category/${product.category}`)} className="hover:text-brand-accent transition-colors">{product.category}</button>
                </>
            )}
            <span className="text-stone-300">/</span>
            <span className="text-brand-charcoal truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 items-start">
            
            {/* Gallery: Main Image + Thumbnails */}
            <div className="w-full lg:col-span-6 space-y-6">
                <div className="relative">
                    <ProductParallaxGallery images={images} currentIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} />
                    
                    {images.length > 1 && (
                        <div className="absolute inset-0 hidden lg:flex items-center justify-between px-4 pointer-events-none">
                            <button 
                                onClick={() => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                                className="w-10 h-10 flex items-center justify-center bg-white/40 backdrop-blur-md text-brand-charcoal pointer-events-auto rounded-full hover:bg-white/80 transition-all z-10"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={() => setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                                className="w-10 h-10 flex items-center justify-center bg-white/40 backdrop-blur-md text-brand-charcoal pointer-events-auto rounded-full hover:bg-white/80 transition-all z-10"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {images.map((img, i) => (
                            <button 
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                className={`relative flex-shrink-0 w-20 h-24 md:w-24 md:h-32 bg-stone-100 border-2 transition-all duration-300 ${currentImageIndex === i ? 'border-brand-charcoal opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i}`} referrerPolicy="no-referrer" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Details Sidebar */}
            <div className="w-full lg:col-span-6 pt-8 lg:pt-0 lg:pl-6 xl:pl-10">
                <div className="lg:sticky lg:top-32 space-y-8 lg:space-y-12">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] lg:text-[10px] font-display font-bold text-brand-accent uppercase tracking-[0.5em]">{product.fabric || product.category}</span>
                            <Share2 className="w-4 h-4 text-brand-muted cursor-pointer hover:text-brand-charcoal transition-colors" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-product font-semibold sm:font-medium text-brand-charcoal leading-snug sm:leading-tight mb-4 sm:mb-6">{product.name}</h1>
                        
                        {/* Improved Price Styling - Refined for Luxury Aesthetic */}
                        <div className="py-2 space-y-2">
                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl md:text-4xl font-sans font-bold text-brand-charcoal tracking-tight">
                                    ৳{(product.price || 0).toLocaleString()}
                                </span>
                                {(product.regularPrice || 0) > (product.price || 0) && (
                                    <span className="text-lg md:text-xl text-brand-muted/40 line-through font-light decoration-brand-muted/20">
                                        ৳{(product.regularPrice || 0).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            
                            {(product.regularPrice || 0) > (product.price || 0) && (
                                <div className="flex items-center md:pt-[0.88rem]">
                                    <span className="text-[11px] font-display font-bold text-brand-accent uppercase tracking-[0.3em]">
                                        Limited Offer • Saving ৳{((product.regularPrice || 0) - (product.price || 0)).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isOutOfStock && (
                        <div className="space-y-12">
                            {/* Size Selection */}
                            <div className="space-y-6 my-6 md:my-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs lg:text-sm font-display font-medium text-brand-muted uppercase tracking-[0.11em]">Select Fit</h3>
                                    <button 
                                        onClick={() => setIsSizeGuideOpen(true)}
                                        className="flex items-center gap-2 text-[9px] lg:text-[10px] font-display font-bold text-brand-muted uppercase tracking-[0.2em] hover:text-brand-charcoal transition-colors group"
                                    >
                                        <Ruler className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-6 h-10 md:h-12 flex items-center justify-center text-[10px] lg:text-[12px] font-display font-black uppercase tracking-widest transition-all duration-500 border ${selectedSize === size ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-transparent text-brand-muted border-[rgba(145,140,140,0.3)] hover:border-brand-charcoal'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-8 lg:space-y-12">
                                <div className="flex items-center justify-between lg:justify-start lg:gap-12">
                                    <h3 className="text-xs lg:text-sm font-display font-medium text-brand-muted uppercase tracking-[0.11em]">Quantity</h3>
                                    <div className="flex items-center gap-6 bg-white px-4 py-2 border border-brand-charcoal/10 rounded-full">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-brand-muted hover:text-brand-charcoal transition-colors p-1"><Minus className="w-3.5 h-3.5"/></button>
                                        <span className="text-xs lg:text-sm font-sans font-bold tracking-widest min-w-[1.2rem] text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)} className="text-brand-muted hover:text-brand-charcoal transition-colors p-1"><Plus className="w-3.5 h-3.5"/></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-4">
                                    <button 
                                        onClick={handleAddToCart}
                                        className="luxury-button-outline w-full"
                                    >
                                        Add to Cart
                                    </button>
                                    <button 
                                        onClick={handleBuyNow}
                                        className="luxury-button w-full"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isOutOfStock && (
                        <div className="p-8 border border-brand-accent/20 bg-brand-accent/[0.02] text-center">
                            <span className="text-[10px] font-display font-bold uppercase tracking-[0.5em] text-brand-accent">Currently Unavailable</span>
                        </div>
                    )}

                    <div className="pt-8 border-t border-brand-border space-y-1">
                        <Accordion title="Details" defaultOpen>
                            <div className="text-brand-charcoal font-medium leading-relaxed">
                                {(product.description || "").replace(/Build with Google AI Studio|Build with Gemini|Built with AI|Powered by AI/gi, '').trim()}
                            </div>
                        </Accordion>
                        <Accordion title="Fabric & Care">
                            <div className="text-brand-charcoal font-medium leading-relaxed">
                                The essence of {product.fabric || 'timeless textile'}, selected for its sophisticated drape and heritage quality. An ethical masterpiece from our artisan collection.
                            </div>
                        </Accordion>
                        <Accordion title="Shipping & Return">
                            <div className="space-y-6 py-4">
                                <div className="flex gap-5 items-start">
                                    <Truck className="w-4 h-4 text-brand-charcoal/60" />
                                    <div>
                                        <p className="text-xs font-display font-medium text-brand-charcoal uppercase tracking-normal mb-1.5">Private Delivery</p>
                                        <p className="text-xs text-brand-charcoal/80 leading-relaxed font-normal">Delivered with care within 3-5 business days. Each piece undergoes a rigorous quality inspection and is securely wrapped to ensure it reaches you in perfect condition.</p>
                                    </div>
                                </div>
                                <div className="flex gap-5 items-start">
                                    <RefreshCw className="w-4 h-4 text-brand-charcoal/60" />
                                    <div>
                                        <p className="text-xs font-display font-medium text-brand-charcoal uppercase tracking-normal mb-1.5">Bespoke Returns</p>
                                        <p className="text-xs text-brand-charcoal/80 leading-relaxed font-normal">Your satisfaction is our cornerstone. Inquire with our concierge for seamless replacements.</p>
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="flex flex-col gap-4">
                            <ShieldCheck className="w-5 h-5 text-brand-charcoal/30" />
                            <span className="text-[9px] lg:text-[10px] font-display font-bold text-brand-muted uppercase tracking-[0.3em]">Certified Piece</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <CreditCard className="w-5 h-5 text-brand-charcoal/30" />
                            <span className="text-[9px] lg:text-[10px] font-display font-bold text-brand-muted uppercase tracking-[0.3em]">Protected Escrow</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductDetailsPage;

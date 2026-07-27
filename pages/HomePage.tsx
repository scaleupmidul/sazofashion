
import React, { useRef, useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import HeroSlider from '../components/HeroSlider';
import BrandVideoCard from '../components/BrandVideoCard';
import { Skeleton, Shimmer } from '../components/Skeleton';
import { useAppStore } from '../store';
import { Product } from '../types';
import { ShieldCheck, Truck, Sparkles, ArrowRight, CreditCard, Zap, Heart, Star, Layers, MousePointer2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import AmbientParticleCanvas from '../components/AmbientParticleCanvas';

const ParallaxImage: React.FC<{ 
    src: string; 
    alt: string; 
    shapeClass: string; 
    speed?: number; 
    parallax?: boolean;
    parallaxMode?: 'standard' | 'fixedWindow';
}> = ({ src, alt, shapeClass, speed = 0.1, parallax = true, parallaxMode = 'standard' }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    
    const standardY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const fixedWindowY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    const standardScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);
    const fixedWindowScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.04, 1.1]);

    const y = parallaxMode === 'fixedWindow' ? fixedWindowY : standardY;
    const scale = parallaxMode === 'fixedWindow' ? fixedWindowScale : standardScale;
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoaded(false);
        setError(false);
    }, [src]);

    const hasImage = !!src && typeof src === 'string' && src.trim() !== '';

    return (
        <div ref={ref} className={`relative overflow-hidden ${shapeClass}`}>
            {(!hasImage || error) ? (
                <div className="absolute inset-0 bg-[#f3f0ea]/70 backdrop-blur-md flex items-center justify-center">
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-[#C38B7C]/10 filter blur-2xl animate-[pulse_6s_infinite_ease-in-out]" />
                    <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 rounded-full bg-[#1A1A1A]/5 filter blur-xl animate-[pulse_4s_infinite_ease-in-out_1s]" />
                </div>
            ) : (
                <>
                    {!loaded && (
                        <div className="absolute inset-0 bg-[#f3f0ea]/70 backdrop-blur-md flex items-center justify-center z-10">
                            <div className="w-full h-full bg-gradient-to-r from-stone-100 via-stone-200/50 to-stone-100 bg-[length:200%_100%] animate-pulse" />
                            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-[#C38B7C]/10 filter blur-2xl animate-[pulse_4s_infinite]" />
                        </div>
                    )}
                    <motion.img 
                        src={src} 
                        alt={alt}
                        onLoad={() => setLoaded(true)}
                        onError={() => setError(true)}
                        style={parallax ? { y, scale, willChange: 'transform', opacity: loaded ? 1 : 0 } : { opacity: loaded ? 1 : 0 }}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-brand-charcoal/10 transition-opacity duration-700 group-hover:opacity-40"></div>
                </>
            )}
        </div>
    );
};

const SectionHeader: React.FC<{ title: string; subtitle?: string; light?: boolean }> = ({ title, subtitle, light }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
    className="flex flex-col items-center text-center mb-16 md:mb-24 px-4"
  >
    <span className={`text-[9px] lg:text-[10px] font-display font-bold uppercase tracking-[0.4em] mb-4 ${light ? 'text-white/80' : 'text-brand-accent'}`}>
        {subtitle || 'Exceptional Quality'}
    </span>
    <h2 className={`text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-serif font-light leading-tight ${light ? 'text-white' : 'text-brand-charcoal'}`}>
        {title}
    </h2>
  </motion.div>
);

const FeatureBox: React.FC<{ icon: React.ElementType; title: string; desc: string; index: number }> = ({ icon: Icon, title, desc, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 1, ease: [0.19, 1, 0.22, 1] }}
        className="flex flex-col items-center text-center px-6 py-20 md:px-8 md:py-24 lg:py-32 xl:py-40 group transition-all duration-700 hover:bg-stone-50/50"
    >
        <div className="mb-8 relative">
            <div className="absolute inset-0 bg-brand-accent/5 scale-0 group-hover:scale-150 rounded-full transition-transform duration-1000"></div>
            <Icon size={30} strokeWidth={1} className="text-brand-charcoal group-hover:text-brand-accent transition-colors duration-700 relative z-10" />
        </div>
        <h4 className="text-[10px] lg:text-[12px] font-sans font-black text-brand-charcoal mb-4 uppercase tracking-[0.3em]">{title}</h4>
        <p className="text-brand-muted text-[10px] md:text-[11px] lg:text-[13px] leading-relaxed w-full max-w-[280px] font-medium uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity duration-700">{desc}</p>
    </motion.div>
);

const HomeSkeleton: React.FC = () => (
    <div className="flex flex-col w-full bg-white">
        {/* Hero Slider Skeleton */}
        <section className="relative w-full aspect-[21/9] md:h-[90vh] bg-stone-50 overflow-hidden">
            <Shimmer className="w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-20">
                <Skeleton className="h-4 w-32 mb-8 opacity-40 px-20" />
                <Skeleton className="h-24 md:h-32 w-3/4 max-w-4xl mb-12" />
                <Skeleton className="h-16 w-64 rounded-full" />
            </div>
        </section>

        {/* Content Blocks Skeleton */}
        <section className="container-luxury py-24 sm:py-32">
            <div className="flex flex-col items-center mb-24">
                <Skeleton className="h-3 w-40 mb-6 opacity-40" />
                <Skeleton className="h-16 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <Shimmer className="aspect-[16/10] w-full" />
                <div className="flex flex-col justify-center space-y-12 h-full">
                   <Shimmer className="aspect-square w-2/3 rounded-full" />
                   <div className="space-y-4">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-10 w-48" />
                   </div>
                </div>
            </div>
        </section>

        {/* Trending Section Skeleton */}
        <section className="bg-brand-offwhite py-24 md:py-44">
            <div className="container-luxury">
                <div className="flex flex-col items-center mb-16 sm:mb-24 text-center">
                    <Skeleton className="h-3 w-40 mb-4 opacity-40 mr-1" />
                    <Skeleton className="h-12 w-64" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-20">
                    {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            </div>
        </section>
    </div>
);

const StorySection: React.FC = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const storyY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-charcoal py-32">
            <motion.div 
                style={{ y: storyY, height: '120%', top: '-10%', willChange: 'transform' }}
                className="absolute inset-0 z-0"
            >
                <img src="https://images.unsplash.com/photo-1518764876364-2d0bc97401d4?q=80&w=2070" className="w-full h-full object-cover opacity-20 grayscale" alt="Brand Story" />
            </motion.div>

            {/* Elegant luxury textile ambient dust and fibers drifting upwards */}
            <AmbientParticleCanvas 
                moteCount={24}
                fiberCount={8}
                className="absolute inset-0 pointer-events-none z-[5]"
                speedMultiplier={0.4}
                particleColor="235, 218, 204"
                glowColor="250, 242, 235"
            />
            
            <div className="container-luxury relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                >
                  <h2 className="text-5xl md:text-6xl lg:text-8xl xl:text-[110px] font-serif font-light text-white leading-[0.9] mb-16 italic">
                    Empowering the <br /> <span className="text-brand-accent">Modern Matriarch</span>
                  </h2>
                  <p className="text-[0.65rem] md:text-sm font-sans font-light text-white/80 mb-16 leading-loose max-w-2xl mx-auto uppercase tracking-[0.3em]">
                      SAZO is not just about fashion; it's about the soul of the woman wearing it. Every stitch is a story of strength, every fabric a memory of soft grace.
                  </p>
                  <button onClick={() => window.location.href='/about'} className="text-[9px] md:text-[10px] lg:text-[11px] font-display font-black text-white uppercase tracking-[0.4em] border-b border-white pb-2 md:pb-3 hover:text-brand-accent hover:border-brand-accent transition-all duration-700">
                      Our Narrative
                  </button>
                </motion.div>
            </div>
        </section>
    );
};

const HomePage: React.FC = () => {
  const { products, navigate, settings, loading } = useAppStore(state => ({
    products: state.products,
    navigate: state.navigate,
    settings: state.settings,
    loading: state.loading
  }));

  if (loading && products.length === 0) return <HomeSkeleton />;

  const { homepageNewArrivalsCount, homepageTrendingCount } = settings;

  const getSortedProducts = (items: Product[], key: 'newArrivalDisplayOrder' | 'trendingDisplayOrder') => {
      // Ensure items are unique by ID first
      const uniqueItemsMap = new Map<string, Product>();
      items.forEach(p => uniqueItemsMap.set(String(p.id), p));
      const uniqueItems = Array.from(uniqueItemsMap.values());

      const pinned = uniqueItems.filter(p => p[key] && p[key]! < 1000).sort((a, b) => (a[key] || 0) - (b[key] || 0));
      const others = uniqueItems.filter(p => !p[key] || p[key]! >= 1000).sort((a, b) => String(b.id || '').localeCompare(String(a.id || '')));
      return [...pinned, ...others];
  };

  const allNewArrivals = getSortedProducts(products.filter(p => p.isNewArrival), 'newArrivalDisplayOrder');
  const allTrendingProducts = getSortedProducts(products.filter(p => p.isTrending), 'trendingDisplayOrder');
  const nonTrendingProducts = getSortedProducts(products.filter(p => !p.isTrending), 'trendingDisplayOrder');

  const trendingListRaw = allTrendingProducts.length >= 8 
    ? allTrendingProducts 
    : [...allTrendingProducts, ...nonTrendingProducts];

  const uniqueTrendingMap = new Map<string, Product>();
  trendingListRaw.forEach(p => uniqueTrendingMap.set(String(p.id), p));
  
  const newArrivalsDisplay = allNewArrivals.slice(0, homepageNewArrivalsCount || 4);
  const trendingProductsDisplay = Array.from(uniqueTrendingMap.values()).slice(0, Math.max(homepageTrendingCount || 8, 8));

  // Derive category items strictly from settings.categories
  const activeCategories = (settings.categories || []).filter(
    cat => !(settings.pausedCategories || []).includes(cat)
  );

  const categoryDisplayItems = activeCategories.map((catName) => {
    const catSetting = (settings.categoryImages || []).find(
      ci => ci.categoryName && ci.categoryName.toLowerCase() === catName.toLowerCase()
    );
    // Find products under this category to use first image as fallback if custom image is empty
    const catProducts = products.filter(p => p.category && p.category.toLowerCase() === catName.toLowerCase());
    const fallbackProductImage = catProducts.find(p => p.images && p.images.length > 0)?.images[0];

    const image = catSetting?.image?.trim() 
      ? catSetting.image 
      : (fallbackProductImage || '');

    return {
      title: catName,
      subtitle: catSetting?.subtitle || 'Explore Collection',
      image,
      link: `/category/${encodeURIComponent(catName.toLowerCase().replace(/\s+/g, '-'))}`
    };
  });

  return (
    <div className="bg-white overflow-x-hidden">
      <HeroSlider />

      {/* --- NEW ARRIVALS SHOWCASE --- */}
      {newArrivalsDisplay.length > 0 && (
        <section className="py-20 md:py-36 bg-white border-b border-stone-100">
          <div className="container-luxury">
            <SectionHeader title="New Arrivals" subtitle="Fresh Selections" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-16 md:gap-x-10 md:gap-y-20">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              ) : (
                newArrivalsDisplay.map((p, i) => (
                  <div key={`new-${p.id}-${i}`}>
                    <ProductCard product={p} />
                  </div>
                ))
              )}
            </div>
            <div className="mt-16 md:mt-24 flex justify-center">
              <button 
                onClick={() => navigate('/shop')} 
                className="luxury-button-outline"
              >
                Explore New Collection
              </button>
            </div>
          </div>
        </section>
      )}

      {/* --- CURATED CATEGORY HIGHLIGHTS --- */}
      {categoryDisplayItems.length > 0 && (
        <section className="py-20 md:py-32 bg-[#faf7f2] border-t border-stone-200/60 relative overflow-hidden">
          <div className="container-luxury">
            <SectionHeader title="Curated Collections" subtitle="Explore By Category" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {categoryDisplayItems.map((cat, idx) => {
                const hasImage = Boolean(cat.image);
                return (
                  <motion.div
                    key={`${cat.title}-${idx}`}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
                    onClick={() => navigate(cat.link)}
                    className={`group relative h-[420px] sm:h-[500px] overflow-hidden cursor-pointer ${
                      hasImage 
                        ? 'bg-stone-900 shadow-md' 
                        : 'bg-[#f0ede8] shadow-sm'
                    }`}
                  >
                    {hasImage ? (
                      <>
                        <img 
                          src={cat.image} 
                          alt={cat.title} 
                          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-108"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition-opacity duration-500 group-hover:from-black/95" />
                        
                        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white z-20">
                          <span className="text-[10px] font-sans font-medium uppercase tracking-[0.25em] text-amber-200/90 mb-1.5">
                            {cat.subtitle}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-serif italic text-white tracking-wide mb-3 transition-transform duration-500 group-hover:translate-x-1">
                            {cat.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-white/80 group-hover:text-brand-accent transition-colors duration-300">
                            <span className="relative pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-accent group-hover:after:w-full after:transition-all after:duration-300">Shop Collection</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Blank Light Product Card Style */}
                        <div className="w-full h-full bg-[#f0ede8]" />
                        
                        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-20 bg-gradient-to-t from-stone-300/30 via-transparent to-transparent">
                          <span className="text-[10px] font-sans font-medium uppercase tracking-[0.25em] text-stone-500 mb-1.5">
                            {cat.subtitle}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-serif italic text-stone-900 tracking-wide mb-3 transition-transform duration-500 group-hover:translate-x-1">
                            {cat.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-stone-900 group-hover:text-brand-accent transition-colors duration-300">
                            <span className="relative pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-accent group-hover:after:w-full after:transition-all after:duration-300">Shop Collection</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}

              {/* Brand Video Card */}
              {settings.brandVideoEnabled !== false && (
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: categoryDisplayItems.length * 0.1, ease: [0.19, 1, 0.22, 1] }}
                  className={categoryDisplayItems.length === 2 ? 'sm:col-span-2 lg:col-span-2' : ''}
                >
                  <BrandVideoCard
                    videoUrl={settings.brandVideoUrl || ''}
                    mobileVideoUrl={settings.brandVideoMobileUrl || ''}
                    title={settings.brandVideoTitle || 'Sazo Couture'}
                    subtitle={settings.brandVideoSubtitle || 'Behind The Craft'}
                    posterImage={settings.brandVideoPoster || ''}
                    mobilePosterImage={settings.brandVideoMobilePoster || ''}
                    className="h-[420px] sm:h-[500px]"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* --- TRENDING PRODUCTS GRID --- */}
      <section className="bg-brand-offwhite pt-16 pb-24 md:pt-24 md:pb-36">
        <div className="container-luxury">
            <SectionHeader title="The Edit" subtitle="Trending Selection" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-16 md:gap-x-10 md:gap-y-20">
                {loading ? (
                    [...Array(8)].map((_, i) => (
                      <div key={i} className={i >= 6 ? "hidden lg:block" : ""}>
                        <ProductSkeleton />
                      </div>
                    ))
                ) : (
                    trendingProductsDisplay.map((p, i) => (
                        <div key={`${p.id}-${i}`} className={i >= 6 ? "hidden lg:block" : ""}>
                          <ProductCard product={p} />
                        </div>
                    ))
                )}
            </div>
            <div className="mt-20 md:mt-32 flex justify-center">
                <button 
                  onClick={() => navigate('/shop')} 
                  className="luxury-button-outline"
                >
                    Showcase All Products
                </button>
            </div>
        </div>
      </section>

      {/* --- BRAND STORY / VISION --- */}
      <StorySection />

      {/* --- TRUST & CRAFTSMANSHIP --- */}
      <section className="py-12 md:py-24 bg-white border-t border-stone-100">
          <div className="container-luxury max-w-screen-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-stone-100">
                  <FeatureBox icon={ShieldCheck} title="AUTHENTIC QUALITY" desc="Curated premium fabrics & original beauty essentials." index={0} />
                  <FeatureBox icon={Truck} title="EXPRESS DELIVERY" desc="Swift delivery across Bangladesh, right to your doorstep." index={1} />
                  <FeatureBox icon={CreditCard} title="SECURE PAYMENT" desc="Safe and encrypted payment options for your peace of mind." index={2} />
                  <FeatureBox icon={Sparkles} title="EXCLUSIVE STYLES" desc="Limited edition designs for the modern elegance." index={3} />
              </div>
          </div>
      </section>
    </div>
  );
};

export default HomePage;

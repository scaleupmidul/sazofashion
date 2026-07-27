
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { Skeleton, Shimmer } from '../components/Skeleton';
import { Search, ChevronDown, SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';
import { Product } from '../types';
import { trackServerEvent } from '../services/trackingService';
import { motion, AnimatePresence } from 'motion/react';

const ShopPage: React.FC = () => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        setIsDesktop(mediaQuery.matches);
        
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const { products, isInitialLoading, ensureAllProductsLoaded, fullProductsLoaded, pausedCategories } = useAppStore(state => ({
        products: state.products,
        isInitialLoading: state.loading,
        ensureAllProductsLoaded: state.ensureAllProductsLoaded,
        fullProductsLoaded: state.fullProductsLoaded,
        pausedCategories: state.settings?.pausedCategories || []
    }));
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (!fullProductsLoaded) {
            ensureAllProductsLoaded();
        }
    }, [ensureAllProductsLoaded, fullProductsLoaded]);

    useEffect(() => {
        if (products.length > 0) {
            setShuffledProducts([...products]);
        }
    }, [products.length]);
  
  const uniqueCategories = useMemo(() => {
    const categories = products.map(p => p.category);
    const unique = categories.filter((value, index, self) => self.indexOf(value) === index);
    return unique.filter(cat => !pausedCategories.includes(cat));
  }, [products, pausedCategories]);

  const [category, setCategory] = useState('All');
  const [color, setColor] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceLimit, setPriceLimit] = useState(10000);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [debouncedPriceLimit, setDebouncedPriceLimit] = useState(10000);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedPriceLimit(priceLimit);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, priceLimit]);

  const filteredProducts = useMemo(() => {
    const baseList = shuffledProducts.length > 0 ? shuffledProducts : products;
    return baseList.filter(p => {
      if (pausedCategories.includes(p.category)) return false;
      const matchesCategory = category === 'All' || p.category === category;
      const matchesPrice = p.price <= debouncedPriceLimit;
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesColor = color === 'All' || p.colors.map(c => c.toLowerCase()).includes(color.toLowerCase());
      return matchesCategory && matchesPrice && matchesSearch && matchesColor;
    });
  }, [shuffledProducts, products, category, debouncedPriceLimit, debouncedSearchTerm, color, pausedCategories]);
  
  useEffect(() => {
      setCurrentPage(1);
  }, [category, debouncedPriceLimit, debouncedSearchTerm, color]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const productsPerPage = isDesktop ? 12 : 8;

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = useMemo(() => {
      const startIndex = (currentPage - 1) * productsPerPage;
      return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [currentPage, filteredProducts, productsPerPage]);

  const FilterPanel = () => (
    <div className="space-y-12">
      {/* Search Section */}
      <div className="space-y-5">
        <h3 className="text-[10px] lg:text-[11px] font-display font-bold text-brand-charcoal uppercase tracking-[0.3em]">Search Collection</h3>
        <div className="relative group">
            <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 border-b border-brand-border bg-transparent text-sm font-medium outline-none placeholder:text-stone-300 text-brand-charcoal focus:border-brand-charcoal transition-colors"
            />
            <Search className="w-4 h-4 text-brand-muted absolute right-0 top-1/2 -translate-y-1/2 group-focus-within:text-brand-charcoal transition-colors" />
        </div>
      </div>

      {/* Investment Range Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-[10px] lg:text-[11px] font-display font-bold text-brand-charcoal uppercase tracking-[0.3em]">Price Quotient</h3>
            <span className="text-[10px] lg:text-[11px] font-display font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/5 px-3 py-1 rounded-full">
                Up to ৳{priceLimit.toLocaleString()}
            </span>
        </div>
        <div className="px-1 pt-4">
            <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={priceLimit}
                onChange={(e) => setPriceLimit(Number(e.target.value))}
                className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-brand-charcoal luxury-range-slider"
            />
        </div>
        <div className="flex justify-between items-center text-[9px] lg:text-[10px] font-display font-bold text-brand-muted uppercase tracking-widest">
            <span>Min ৳500</span>
            <span>Max ৳10,000</span>
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-5">
        <h3 className="text-[10px] lg:text-[11px] font-display font-bold text-brand-charcoal uppercase tracking-[0.3em]">Curation</h3>
        <div className="flex flex-col space-y-1">
            <button 
                onClick={() => setCategory('All')}
                className={`group flex items-center justify-between w-full py-3 text-[11px] lg:text-xs font-display uppercase tracking-widest transition-all ${category === 'All' ? 'text-brand-charcoal font-black' : 'text-brand-muted hover:text-brand-charcoal font-medium'}`}
            >
                <span>All Collections</span>
                {category === 'All' && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
            </button>
            {uniqueCategories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`group flex items-center justify-between w-full py-3 text-[11px] lg:text-xs font-display uppercase tracking-widest transition-all ${category === cat ? 'text-brand-charcoal font-black' : 'text-brand-muted hover:text-brand-charcoal font-medium'}`}
                >
                    <span>{cat}</span>
                    {category === cat && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                </button>
            ))}
        </div>
      </div>

      {/* Color Palettes Section */}
      <div className="space-y-5">
        <h3 className="text-[10px] lg:text-[11px] font-display font-bold text-brand-charcoal uppercase tracking-[0.3em]">Palettes</h3>
        <div className="flex flex-wrap gap-2.5 pt-2">
          {['All', 'Pink', 'White', 'Black', 'Gold', 'Sage', 'Lavender'].map(c => (
            <button 
                key={c} 
                onClick={() => setColor(c)} 
                className={`px-5 py-2.5 text-[9px] lg:text-[10px] font-display font-black uppercase tracking-[0.2em] transition-all duration-500 border ${color === c ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-lg shadow-black/10' : 'bg-transparent text-brand-muted border-brand-border hover:border-brand-charcoal active:scale-95'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <div className="pt-4">
          <button 
            onClick={() => { setCategory('All'); setColor('All'); setSearchTerm(''); setPriceLimit(10000); }}
            className="text-[9px] lg:text-[10px] font-display font-bold text-brand-muted hover:text-brand-accent uppercase tracking-[0.3em] transition-colors border-b border-transparent hover:border-brand-accent pb-1"
          >
              Reset Filters
          </button>
      </div>
    </div>
  );

  const showSkeletons = (isInitialLoading || shuffledProducts.length === 0) && products.length === 0;

  return (
    <main className="max-w-[1750px] mx-auto w-full px-3 sm:px-12 lg:px-24 pt-[4.5rem] sm:pt-32 pb-24">
      {/* Header */}
      <div className="flex flex-col items-center mb-[4rem] sm:mb-16 text-center">
            <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                className="text-[10px] lg:text-[11px] font-bold text-brand-accent uppercase tracking-[0.4em] mb-2 sm:mb-6"
            >
                The Collection
            </motion.span>
            <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 1, ease: [0.19, 1, 0.22, 1] }}
                className="text-[2.1rem] md:text-[3rem] lg:text-[4rem] font-sans font-black text-brand-charcoal tracking-[-0.04em] uppercase"
            >
                SAZO<span className="inline-block w-[0.18em] h-[0.18em] rounded-full bg-brand-accent align-baseline"></span>FASHION
            </motion.h1>
      </div>

      <div className="flex justify-between items-center mb-8 sm:mb-12 border-b border-stone-100 pb-6 sm:pb-10">
            <div className="text-[10px] lg:text-[11px] font-bold text-stone-400 uppercase tracking-[0.4em]">
                {/* Items count removed */}
            </div>
            
            <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-4 group"
            >
                <span className="text-[10px] lg:text-[11px] font-display font-bold text-brand-charcoal uppercase tracking-[0.2em] group-hover:text-brand-accent transition-colors">Refine Search</span>
                <div className="w-8 h-8 rounded-full border border-brand-charcoal/10 flex items-center justify-center group-hover:bg-brand-charcoal transition-all duration-500">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand-muted group-hover:text-white transition-colors" />
                </div>
            </button>
      </div>

      <div className="w-full">
        {/* Mobile & Desktop Filter (Modal/Drawer) */}
        <AnimatePresence>
            {isFilterOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100]"
                        onClick={() => setIsFilterOpen(false)}
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl overflow-y-auto p-12 sm:p-20"
                    >
                        <div className="flex justify-between items-center mb-12 border-b border-brand-border pb-6">
                            <h3 className="font-serif text-3xl italic text-brand-charcoal">Refine</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-stone-50 transition-colors">
                                <X className="w-5 h-5 text-brand-charcoal/40" />
                            </button>
                        </div>
                        <FilterPanel />
                        <div className="mt-12 sticky bottom-0 bg-white pb-10 pt-4">
                            <button 
                                onClick={() => setIsFilterOpen(false)} 
                                className="w-full h-14 bg-brand-charcoal text-white text-[10px] lg:text-[11px] font-display font-bold uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-[0.98]"
                            >
                                SHOW RESULTS
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Products Grid Skeleton */}
        <section className="w-full">
          {showSkeletons ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-12 sm:gap-12 lg:gap-16">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 bg-stone-50/30 rounded-[4rem] border border-stone-100 border-dashed">
                <span className="text-[10px] lg:text-[11px] font-bold text-stone-500 uppercase tracking-[0.4em] mb-4">No results found</span>
                <p className="text-xl font-fashion italic text-stone-900">Please refine your selections</p>
                <button onClick={() => { setCategory('All'); setColor('All'); setSearchTerm(''); }} className="mt-8 text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:underline">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-12 sm:gap-12 lg:gap-16">
                {currentProducts.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: (idx % 4) * 0.1, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-20 sm:mt-32 border-t border-stone-100 pt-10">
                      {/* Left Side: Prev Button */}
                      <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-brand-charcoal hover:text-brand-accent disabled:opacity-20 group transition-all font-medium"
                      >
                          <span className="w-6 h-px bg-stone-300 group-hover:bg-brand-accent group-hover:w-10 transition-all duration-300" />
                          Prev
                      </button>

                      {/* Center: Luxury Page Numbers */}
                      <div className="flex items-center gap-6 sm:gap-8">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                              const isSelected = page === currentPage;
                              const formattedPage = String(page).padStart(2, '0'); // "01", "02", etc.
                              return (
                                  <button
                                      key={page}
                                      onClick={() => setCurrentPage(page)}
                                      className={`relative text-[11px] tracking-widest font-medium transition-all py-1 px-2 group ${
                                          isSelected 
                                              ? 'text-brand-charcoal' 
                                              : 'text-stone-400 hover:text-brand-charcoal'
                                      }`}
                                  >
                                      {formattedPage}
                                      {/* Dynamic Underline on Selection or Hover */}
                                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-brand-charcoal transition-all duration-500 ${
                                          isSelected ? 'w-full' : 'w-0 group-hover:w-full'
                                      }`} />
                                  </button>
                              );
                          })}
                      </div>

                      {/* Right Side: Next Button */}
                      <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-brand-charcoal hover:text-brand-accent disabled:opacity-20 group transition-all font-medium"
                      >
                          Next
                          <span className="w-6 h-px bg-stone-300 group-hover:bg-brand-accent group-hover:w-10 transition-all duration-300" />
                      </button>
                  </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default ShopPage;


import React, { memo } from 'react';
import { Product } from '../types';
import { useAppStore } from '../store';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
    const regularPrice = product.regularPrice || product.price + 200;
    const navigate = useAppStore(state => state.navigate);
    const isOutOfStock = product.isOutOfStock ?? false;
    const linkId = product.productId || product.id;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }} // Super smooth ease out
            className={`group flex flex-col cursor-pointer ${isOutOfStock ? 'opacity-60 grayscale-[0.3]' : ''}`}
            onClick={() => navigate(`/product/${linkId}`)}
        >
            {/* Image Wrapper */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f0ede8]">
                <img
                    src={product.images && product.images[0]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    loading={priority ? "eager" : "lazy"}
                    referrerPolicy="no-referrer"
                />
                
                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 sm:top-4 sm:left-4 flex flex-col gap-0.5 z-10">
                    {product.isNewArrival && (
                        <div className="bg-brand-charcoal text-white text-[6px] sm:text-[8px] font-display font-bold tracking-[0.2em] px-1 py-0.5 sm:px-2 sm:py-1 uppercase">New</div>
                    )}
                    {product.onSale && (
                        <div className="bg-brand-accent text-white text-[6px] sm:text-[8px] font-display font-bold tracking-[0.2em] px-1 py-0.5 sm:px-2 sm:py-1 uppercase">Best</div>
                    )}
                </div>

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-brand-charcoal/20 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-[10px] lg:text-[11px] font-display font-black text-white uppercase tracking-[0.3em]">Sold Out</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="pt-2 sm:pt-3 pb-1 flex flex-col items-center text-center space-y-0.5 sm:space-y-1">
                <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-display font-bold text-brand-muted uppercase tracking-[0.15em] sm:tracking-[0.2em]">{product.fabric || product.category}</span>
                <h3 className="font-product text-base sm:text-lg md:text-xl lg:text-2xl font-semibold sm:font-medium text-brand-charcoal leading-snug group-hover:text-brand-accent transition-colors duration-300 truncate w-full px-1 text-center">{product.name}</h3>
                <div className="flex items-center gap-2 sm:gap-3 pt-0.5">
                    <span className="text-xs sm:text-sm md:text-base font-sans font-bold text-brand-charcoal">৳{(product.price || 0).toLocaleString('en-IN')}</span>
                    {product.onSale && (
                        <span className="text-[10px] sm:text-xs md:text-sm font-sans text-brand-muted/70 line-through font-normal">৳{(regularPrice || 0).toLocaleString('en-IN')}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default memo(ProductCard);

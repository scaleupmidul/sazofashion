
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingCart, X, ArrowRight } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  addToCart: (product: Product, quantity: number, size: string) => void;
  navigate: (path: string) => void;
  notify: (message: string, type?: 'success' | 'error') => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose, addToCart, navigate, notify }) => {
  const [quantity, setQuantity] = useState(1);
  const isFreeSizeOnly = product?.sizes.length === 1 && product.sizes[0] === 'Free';
  const [selectedSize, setSelectedSize] = useState<string | null>(isFreeSizeOnly ? 'Free' : null);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      const isFreeSize = product.sizes.length === 1 && product.sizes[0] === 'Free';
      setSelectedSize(isFreeSize ? 'Free' : null);
    }
  }, [product]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      notify("Please select a size.", "error");
      return;
    }
    addToCart(product, quantity, selectedSize);
    onClose();
    navigate('/cart');
  };
  
  const handleNavigateToDetails = () => {
      onClose();
      // Use productId if available, otherwise fallback to id
      const linkId = product.productId || product.id;
      navigate(`/product/${linkId}`);
  }

  const regularPrice = product.regularPrice || product.price + 200;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition z-10" aria-label="Close">
          <X className="w-6 h-6" />
        </button>

        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#f0ede8]">
            {/* FIX: Corrected property access from `product.image` to `product.images[0]` to match the Product type. */}
            <img src={product.images && product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>

        <div className="flex flex-col space-y-4 overflow-y-auto pr-2">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-product font-medium text-brand-charcoal leading-snug">{product.name}</h2>
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-2xl sm:text-3xl font-sans font-bold text-brand-charcoal tracking-tight">৳{product.price.toLocaleString('en-IN')}</span>
              {product.price < regularPrice && (
                <span className="text-base text-brand-muted/40 line-through font-light">৳{regularPrice.toLocaleString('en-IN')}</span>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mt-4 whitespace-pre-wrap">{product.description}</p>
          </div>
            
          <div className="space-y-4 pt-4 pb-6 border-y border-stone-100">
            <p className="text-[10px] font-display font-bold text-brand-muted uppercase tracking-[0.2em]">Select Size: <span className="text-brand-accent">{selectedSize === 'Free' ? 'Free Size' : (selectedSize || 'Choose')}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => !isFreeSizeOnly && setSelectedSize(size)}
                  className={`h-11 ${size === 'Free' ? 'px-6' : 'w-14'} text-[10px] font-display font-bold uppercase tracking-widest border transition-all duration-300 ${selectedSize === size ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-transparent text-brand-muted border-stone-200 hover:border-brand-charcoal'} ${isFreeSizeOnly && size !== 'Free' ? 'opacity-30 cursor-not-allowed' : ''}`}
                  disabled={isFreeSizeOnly && size !== 'Free'}
                >
                  {size}
                </button>
              ))}
            </div>
            {isFreeSizeOnly && <p className="text-[10px] text-brand-accent font-medium tracking-wide">Standard sizing applies</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <div className="flex items-center border border-stone-200 rounded-[2px] h-14 w-full sm:w-auto px-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-charcoal transition-colors font-medium">-</button>
              <span className="flex-1 sm:w-10 text-center font-sans font-bold text-sm text-brand-charcoal">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-charcoal transition-colors font-medium">+</button>
            </div>
            <button onClick={handleAddToCart} className="flex-grow h-14 bg-transparent text-brand-charcoal border border-stone-200 text-[10px] font-display font-black uppercase tracking-[0.4em] px-8 hover:border-brand-charcoal transition-all duration-700 flex items-center justify-center space-x-3 active:scale-95">
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>
          
          <button onClick={handleNavigateToDetails} className="text-brand-muted hover:text-brand-charcoal transition-all text-[10px] font-display font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-2 pt-6">
             <span>Full Details</span>
             <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

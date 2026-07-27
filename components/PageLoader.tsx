// components/PageLoader.tsx

import React from 'react';

const PageLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md overflow-hidden">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-stone-100/50 to-transparent pointer-events-none" />
    <div className="relative flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 w-16 h-16 border-2 border-stone-100 border-solid rounded-full shadow-inner"></div>
        <div className="absolute inset-0 w-16 h-16 border-2 border-brand-accent border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
      <span className="text-[10px] font-display font-bold text-brand-charcoal/40 uppercase tracking-[0.4em] animate-pulse">SAZO</span>
    </div>
  </div>
);

export default PageLoader;

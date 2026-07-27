
import React from 'react';
import { Shimmer, Skeleton } from './Skeleton';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col space-y-6 group">
      {/* Image Area */}
      <div className="relative aspect-[3/4] w-full bg-stone-50 border border-stone-100 overflow-hidden">
        <Shimmer className="w-full h-full" />
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col items-center text-center space-y-4">
        <Skeleton className="h-3 w-20 opacity-40" />
        <Skeleton className="h-6 w-full" />
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16 opacity-20" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;

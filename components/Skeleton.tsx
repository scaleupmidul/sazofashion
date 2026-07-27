
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-stone-200/50 rounded-md ${className}`} />
  );
};

export const Shimmer: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`relative overflow-hidden bg-stone-100 rounded-none ${className}`}>
      <div className="absolute inset-0 z-10 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-stone-50/60 to-transparent" />
    </div>
  );
};

export const TextSkeleton: React.FC<{ rows?: number; width?: string; className?: string }> = ({ rows = 1, width = "w-full", className = "" }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === rows - 1 && rows > 1 ? 'w-2/3' : width}`} />
      ))}
    </div>
  );
};

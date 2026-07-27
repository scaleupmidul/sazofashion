
import React from 'react';
import { Skeleton, TextSkeleton } from './Skeleton';

const PageSkeleton: React.FC = () => {
  return (
    <div className="container-luxury pt-32 md:pt-48 pb-24 space-y-20">
      <div className="flex flex-col items-center text-center space-y-8">
        <Skeleton className="h-3 w-32 opacity-40 ml-1" />
        <Skeleton className="h-16 w-3/4 max-w-2xl" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <TextSkeleton rows={3} />
            </div>
          ))}
        </div>
        <div className="bg-stone-50 aspect-square md:aspect-auto h-full min-h-[400px] rounded-[4rem] animate-pulse" />
      </div>
    </div>
  );
};

export default PageSkeleton;
